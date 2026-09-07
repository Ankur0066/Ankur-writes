const bcrypt = require('bcrypt');
const { query } = require('./db');

module.exports = async function initAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  // Check if exists
  const users = await query('SELECT id FROM users WHERE email = ?', [adminEmail]);
  if (users.length) return;

  const hashed = await bcrypt.hash(adminPassword, 10);
  await query(
    'INSERT INTO users (email, password_hash, name, is_admin, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
    [adminEmail, hashed, 'Admin']
  );
  console.log('Bootstrap admin created:', adminEmail);
};
