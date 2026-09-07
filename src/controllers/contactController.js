const { query } = require('../db');
const mailer = require('../services/mailer');

async function send(req, res) {
  const { name, email, subject, message } = req.body;
  if (!message) return res.status(400).json({ message: 'message is required' });

  // determine receiver: CONTACT_RECEIVER env or ADMIN_EMAIL
  const receiver = process.env.CONTACT_RECEIVER || process.env.ADMIN_EMAIL || null;

  // insert into inbox_entries
  const result = await query(
    'INSERT INTO inbox_entries (name, email, subject, message, sent_to, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [name || null, email || null, subject || null, message, receiver]
  );

  const entryId = result.insertId;

  // attempt to send email if SMTP configured
  try {
    if (process.env.SMTP_HOST && receiver) {
      const mailOptions = {
        from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com',
        to: receiver,
        subject: subject ? `Contact form: ${subject}` : 'Contact form submission',
        text: `Name: ${name || 'Anonymous'}\nEmail: ${email || 'N/A'}\n\n${message}`,
      };
      await mailer.send(mailOptions);
    }
  } catch (err) {
    // log but don't fail the request
    console.error('Failed to send contact email:', err.message || err);
  }

  const rows = await query('SELECT id, name, email, subject, message, sent_to, created_at FROM inbox_entries WHERE id = ?', [entryId]);
  res.status(201).json(rows[0]);
}

async function list(req, res) {
  const rows = await query('SELECT id, name, email, subject, message, sent_to, created_at FROM inbox_entries ORDER BY created_at DESC');
  res.json({ items: rows });
}

async function get(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ message: 'id required' });
  const rows = await query('SELECT id, name, email, subject, message, sent_to, created_at FROM inbox_entries WHERE id = ?', [id]);
  if (!rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(rows[0]);
}

module.exports = { send, list, get };
