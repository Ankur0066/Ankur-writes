require('dotenv').config();
const { pool, withTransaction } = require('../src/db');

const stories = [
  {
    title: 'A Software Factory Needs One Sandbox per Agent',
    slug: 'software-factory-one-sandbox-per-agent',
    summary: 'How isolated environments turn a group of AI agents into a reliable, scalable engineering team.',
    category: 'Engineering',
    readingTime: 12,
    tags: ['AI engineering', 'Sandboxes', 'Agents'],
    blocks: [
      ['paragraph', { lead: true, text: 'The fastest way to make an AI agent useful is to give it a clear job. The fastest way to make a team of agents useful is to give each one a place to do that job.' }],
      ['paragraph', { text: 'A software factory gives every worker an isolated environment with its own files, dependencies, and tools. That boundary makes parallel work safer and failures easier to recover from.' }],
      ['diagram', { variant: 'agents', caption: 'One request, many focused workers' }],
      ['heading', { text: 'What is a software factory?', id: 'factory' }],
      ['paragraph', { text: 'A software factory turns a product request into a sequence of small, verifiable outputs. A coordinator breaks the request down, sends each task to a specialist, and collects the results.' }],
      ['code', { language: 'typescript', filename: 'factory/assign.ts', code: 'const sandbox = await factory.createSandbox({\\n  task: \"Add validation to the signup form\",\\n  base: \"main\",\\n  tools: [\"node\", \"playwright\"],\\n});' }],
      ['heading', { text: 'What is an agent sandbox?', id: 'sandbox' }],
      ['paragraph', { text: 'An agent sandbox is a boundary around a unit of work. Changes made inside are isolated until they are ready to be reviewed.' }],
      ['quote', { text: 'Give every worker a clean room, a clear contract, and a way to prove what it did.', attribution: 'Dispatch editorial' }],
      ['heading', { text: 'Closing', id: 'closing' }],
      ['paragraph', { text: 'The factory is not a fleet of autonomous bots. It is a set of carefully designed boundaries that let focused agents do their best work.' }],
    ],
  },
  {
    title: 'The quiet power of boring technology',
    slug: 'quiet-power-of-boring-technology',
    summary: 'Why choosing the dependable path is often the most innovative decision your team can make.',
    category: 'Engineering',
    readingTime: 8,
    tags: ['Engineering', 'Systems'],
    blocks: [
      ['paragraph', { lead: true, text: 'The best technology decision is often the one nobody notices.' }],
      ['paragraph', { text: 'Reliable systems create room for teams to focus on their users instead of their infrastructure. Boring is not a lack of ambition; it is a commitment to predictable outcomes.' }],
      ['heading', { text: 'Choose the tool you can explain', id: 'explainable-tools' }],
      ['paragraph', { text: 'A small, understandable system is easier to operate, easier to hire for, and easier to change when the product grows.' }],
      ['code', { language: 'typescript', filename: 'principles.ts', code: 'const defaultChoice = dependable\\nconst exception = justifiedByEvidence' }],
    ],
  },
  {
    title: 'Designing for the moments between',
    slug: 'designing-for-the-moments-between',
    summary: 'The overlooked details that turn a functional interface into one people love to use.',
    category: 'Design systems',
    readingTime: 6,
    tags: ['Design systems', 'Product'],
    blocks: [
      ['paragraph', { lead: true, text: 'Interfaces are remembered in the small moments between the big ones.' }],
      ['paragraph', { text: 'Loading, empty, error, and success states are not edge cases. They are the product experience for a meaningful part of a user’s day.' }],
      ['heading', { text: 'Make the in-between intentional', id: 'intentional-states' }],
      ['paragraph', { text: 'A thoughtful transition gives people confidence that the system understands what they are trying to do.' }],
      ['diagram', { variant: 'scale', caption: 'A clear path from action to outcome' }],
    ],
  },
  {
    title: 'A healthier relationship with your backlog',
    slug: 'healthier-relationship-with-your-backlog',
    summary: 'A practical guide to making space for the work that matters before the urgent work takes over.',
    category: 'Career',
    readingTime: 5,
    tags: ['Career', 'Leadership'],
    status: 'draft',
    blocks: [
      ['paragraph', { lead: true, text: 'A backlog is a map of possibilities, not a moral obligation.' }],
      ['paragraph', { text: 'The healthiest teams regularly remove work that no longer serves the product, then protect time for the work that does.' }],
      ['heading', { text: 'Review the list, not your worth', id: 'review-the-list' }],
      ['paragraph', { text: 'Make prioritization visible, revisit assumptions, and let finished work leave the system.' }],
    ],
  },
];

async function findOrCreateCategory(connection, name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const [existing] = await connection.execute('SELECT id FROM categories WHERE slug = ?', [slug]);
  if (existing.length) return existing[0].id;
  const [created] = await connection.execute('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
  return created.insertId;
}

async function findOrCreateTag(connection, name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const [existing] = await connection.execute('SELECT id FROM tags WHERE slug = ?', [slug]);
  if (existing.length) return existing[0].id;
  const [created] = await connection.execute('INSERT INTO tags (name, slug) VALUES (?, ?)', [name, slug]);
  return created.insertId;
}

async function seedStory(connection, story, authorId) {
  const categoryId = await findOrCreateCategory(connection, story.category);
  const status = story.status || 'published';
  const publishAt = status === 'published' ? '2024-06-12 12:00:00' : null;
  await connection.execute(
    `INSERT INTO posts (author_id, title, slug, summary, category_id, reading_time, status, publish_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), category_id = VALUES(category_id),
       reading_time = VALUES(reading_time), status = VALUES(status), publish_at = VALUES(publish_at), updated_at = NOW()`,
    [authorId, story.title, story.slug, story.summary, categoryId, story.readingTime, status, publishAt],
  );
  const [posts] = await connection.execute('SELECT id FROM posts WHERE slug = ?', [story.slug]);
  const postId = posts[0].id;
  await connection.execute('DELETE FROM post_blocks WHERE post_id = ?', [postId]);
  for (const [sortOrder, [blockType, content]] of story.blocks.entries()) {
    await connection.execute('INSERT INTO post_blocks (post_id, block_type, sort_order, content_json) VALUES (?, ?, ?, ?)', [postId, blockType, sortOrder, JSON.stringify(content)]);
  }
  await connection.execute('DELETE FROM post_tags WHERE post_id = ?', [postId]);
  for (const tag of story.tags) {
    const tagId = await findOrCreateTag(connection, tag);
    await connection.execute('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)', [postId, tagId]);
  }
  return postId;
}

async function main() {
  const [admins] = await pool.execute('SELECT id FROM users WHERE is_admin = 1 ORDER BY id LIMIT 1');
  if (!admins.length) throw new Error('No admin user exists. Start the backend once with ADMIN_EMAIL and ADMIN_PASSWORD configured.');
  const result = await withTransaction(async (connection) => {
    const ids = [];
    for (const story of stories) ids.push(await seedStory(connection, story, admins[0].id));
    return ids;
  });
  console.log(`Seeded ${result.length} stories.`);
  await pool.end();
  process.exitCode = 0;
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  pool.end().catch(() => {});
  process.exitCode = 1;
});
