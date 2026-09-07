const jwt = require('jsonwebtoken');
const { query } = require('../db');
const asyncHandler = require('./asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = auth.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const rows = await query('SELECT id, email, name, is_admin FROM users WHERE id = ?', [payload.sub]);
  if (!rows.length) return res.status(401).json({ message: 'Unauthorized' });
  req.user = rows[0];
  next();
});

const adminOnly = (req, res, next) => {
  if (!req.user || !req.user.is_admin) return res.status(403).json({ message: 'Admin only' });
  next();
};

module.exports = { authenticate, adminOnly };
