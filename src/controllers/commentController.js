const { query } = require('../db');

async function create(req, res) {
  const postId = parseInt(req.params.postId, 10);
  const { author_name, author_email, body } = req.body;
  if (!postId || !body) return res.status(400).json({ message: 'postId and body are required' });

  // ensure post exists
  const posts = await query('SELECT id FROM posts WHERE id = ?', [postId]);
  if (!posts.length) return res.status(404).json({ message: 'Post not found' });

  const result = await query('INSERT INTO comments (post_id, author_name, author_email, body, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
    postId,
    author_name || null,
    author_email || null,
    body,
    'pending',
  ]);

  const insertedId = result.insertId;
  const rows = await query('SELECT id, post_id, author_name, body, status, created_at FROM comments WHERE id = ?', [insertedId]);
  res.status(201).json(rows[0]);
}

async function list(req, res) {
  const postId = parseInt(req.params.postId, 10);
  if (!postId) return res.status(400).json({ message: 'postId required' });

  // ensure post exists
  const posts = await query('SELECT id FROM posts WHERE id = ?', [postId]);
  if (!posts.length) return res.status(404).json({ message: 'Post not found' });

  const rows = await query("SELECT id, post_id, author_name, body, created_at FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at ASC", [postId]);
  res.json({ items: rows });
}

module.exports = { create, list };
