const slugify = require('slugify');
const { query, withTransaction } = require('../db');
const httpError = require('../utils/httpError');
const { validatePostInput } = require('../utils/postValidation');

const MAX_LIMIT = 50;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBlock(row) {
  return {
    id: row.id,
    type: row.block_type,
    data: typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json,
  };
}

function formatPost(post, blocks = [], tags = []) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary || '',
    status: post.status,
    publishedAt: post.publish_at || post.created_at,
    readingTime: post.reading_time || 5,
    category: post.category_name ? { name: post.category_name, slug: post.category_slug } : { name: 'Engineering', slug: 'engineering' },
    author: {
      name: post.author_name || 'Dispatch',
      initials: (post.author_name || 'D').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      avatarUrl: post.author_avatar_url || null,
    },
    tags,
    blocks,
  };
}

async function getPostRowBySlug(slug, includeDrafts = false) {
  const statusClause = includeDrafts ? '' : "AND p.status = 'published' AND (p.publish_at IS NULL OR p.publish_at <= NOW())";
  const rows = await query(
    `SELECT p.id, p.title, p.slug, p.summary, p.body_markdown, p.status, p.publish_at, p.created_at, p.reading_time,
      c.name AS category_name, c.slug AS category_slug,
      u.name AS author_name, u.email AS author_email
     FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN users u ON u.id = p.author_id
     WHERE p.slug = ? ${statusClause}`,
    [slug],
  );
  return rows[0] || null;
}

async function getBlocksAndTags(post) {
  const [blockRows, tagRows] = await Promise.all([
    query('SELECT id, block_type, content_json FROM post_blocks WHERE post_id = ? ORDER BY sort_order ASC, id ASC', [post.id]),
    query('SELECT t.name FROM tags t INNER JOIN post_tags pt ON pt.tag_id = t.id WHERE pt.post_id = ? ORDER BY t.name ASC', [post.id]),
  ]);
  const blocks = blockRows.length
    ? blockRows.map(parseBlock)
    : post.body_markdown
      ? [{ id: `${post.id}-body`, type: 'paragraph', data: { text: post.body_markdown } }]
      : [];
  return { blocks, tags: tagRows.map((tag) => tag.name) };
}

async function list(req, res) {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 10), MAX_LIMIT);
  const offset = (page - 1) * limit;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const filters = ["p.status = 'published'", '(p.publish_at IS NULL OR p.publish_at <= NOW())'];
  const params = [];
  if (search) {
    filters.push('(p.title LIKE ? OR p.summary LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    filters.push('c.slug = ?');
    params.push(category);
  }
  const where = filters.join(' AND ');
  const [rows, countRows] = await Promise.all([
    query(`SELECT p.id, p.title, p.slug, p.summary, p.publish_at, p.created_at, p.reading_time,
      c.name AS category_name, c.slug AS category_slug, u.name AS author_name
      FROM posts p LEFT JOIN categories c ON c.id = p.category_id LEFT JOIN users u ON u.id = p.author_id
      WHERE ${where} ORDER BY COALESCE(p.publish_at, p.created_at) DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE ${where}`, params),
  ]);
  res.json({
    items: rows.map((post) => formatPost(post)),
    page,
    limit,
    total: Number(countRows[0].total),
    totalPages: Math.ceil(Number(countRows[0].total) / limit),
  });
}

async function getBySlug(req, res) {
  const post = await getPostRowBySlug(req.params.slug);
  if (!post) throw httpError(404, 'POST_NOT_FOUND', 'Story not found');
  const { blocks, tags } = await getBlocksAndTags(post);
  res.json(formatPost(post, blocks, tags));
}

async function uniqueSlug(title, excludeId = null) {
  const base = slugify(title, { lower: true, strict: true }) || `story-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (true) {
    const rows = await query('SELECT id FROM posts WHERE slug = ? AND (? IS NULL OR id <> ?)', [slug, excludeId, excludeId]);
    if (!rows.length) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function findOrCreateCategory(connection, category) {
  if (!category) return null;
  const name = typeof category === 'string' ? category.trim() : category.name;
  const slug = slugify(typeof category === 'string' ? category : category.slug || name, { lower: true, strict: true });
  if (!name || !slug) return null;
  const [existing] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [slug]);
  if (existing.length) return existing[0].id;
  const [created] = await connection.execute('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  return created.insertId;
}

async function syncTags(connection, postId, tags = []) {
  if (!Array.isArray(tags)) return;
  await connection.execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);
  for (const value of [...new Set(tags)]) {
    const name = String(value).trim();
    const slug = slugify(name, { lower: true, strict: true });
    if (!name || !slug) continue;
    const [existing] = await connection.execute('SELECT id FROM tags WHERE slug = ?', [slug]);
    let tagId = existing[0] && existing[0].id;
    if (!tagId) {
      const [created] = await connection.execute('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]);
      tagId = created.insertId;
    }
    await connection.execute('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
  }
}

async function syncBlocks(connection, postId, blocks) {
  if (!Array.isArray(blocks)) return;
  await connection.execute('DELETE FROM post_blocks WHERE post_id = ?', [postId]);
  for (const [index, block] of blocks.entries()) {
    await connection.execute('INSERT INTO post_blocks (post_id, block_type, sort_order, content_json) VALUES (?, ?, ?, ?)', [postId, block.type, index, JSON.stringify(block.data)]);
  }
}

async function create(req, res) {
  const errors = validatePostInput(req.body);
  if (errors.length) throw httpError(400, 'VALIDATION_ERROR', errors.join('; '));
  const { title, body_markdown, summary, status = 'draft', publish_at = null, blocks, tags, category, reading_time } = req.body;
  const slug = await uniqueSlug(title);
  const post = await withTransaction(async (connection) => {
    const categoryId = await findOrCreateCategory(connection, category);
    const [result] = await connection.execute(
      'INSERT INTO posts (author_id, title, slug, body_markdown, summary, category_id, reading_time, status, publish_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title.trim(), slug, body_markdown || null, summary || null, categoryId, reading_time || null, status, publish_at || null],
    );
    await syncBlocks(connection, result.insertId, blocks);
    await syncTags(connection, result.insertId, tags);
    return result.insertId;
  });
  res.status(201).json({ id: post, slug });
}

async function update(req, res) {
  const errors = validatePostInput(req.body, { partial: true });
  if (errors.length) throw httpError(400, 'VALIDATION_ERROR', errors.join('; '));
  const id = parsePositiveInt(req.params.id, 0);
  if (!id) throw httpError(400, 'INVALID_POST_ID', 'Post id must be a positive integer');
  const existing = await query('SELECT id, title FROM posts WHERE id = ?', [id]);
  if (!existing.length) throw httpError(404, 'POST_NOT_FOUND', 'Story not found');
  const { title, body_markdown, summary, status, publish_at, blocks, tags, category, reading_time } = req.body;
  const slug = title ? await uniqueSlug(title, id) : null;
  let updatedSlug = slug;
  await withTransaction(async (connection) => {
    const categoryId = category === undefined ? null : await findOrCreateCategory(connection, category);
    await connection.execute(
      `UPDATE posts SET title = COALESCE(?, title), slug = COALESCE(?, slug), body_markdown = COALESCE(?, body_markdown),
       summary = COALESCE(?, summary), category_id = COALESCE(?, category_id), reading_time = COALESCE(?, reading_time),
       status = COALESCE(?, status), publish_at = COALESCE(?, publish_at), updated_at = NOW() WHERE id = ?`,
      [title ?? null, slug, body_markdown ?? null, summary ?? null, categoryId, reading_time ?? null, status ?? null, publish_at ?? null, id],
    );
    await syncBlocks(connection, id, blocks);
    await syncTags(connection, id, tags);
    updatedSlug = slug || (await connection.execute('SELECT slug FROM posts WHERE id = ?', [id]))[0][0].slug;
  });
  res.json({ message: 'updated', id, slug: updatedSlug });
}

async function remove(req, res) {
  const id = parsePositiveInt(req.params.id, 0);
  if (!id) throw httpError(400, 'INVALID_POST_ID', 'Post id must be a positive integer');
  const result = await query('DELETE FROM posts WHERE id = ?', [id]);
  if (!result.affectedRows) throw httpError(404, 'POST_NOT_FOUND', 'Story not found');
  res.status(204).send();
}

module.exports = { list, getBySlug, create, update, remove };
