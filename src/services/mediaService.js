const axios = require('axios');
const FormData = require('form-data');
const { query } = require('../db');

async function uploadToImgBB(file) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) throw new Error('IMGBB_API_KEY not set');

  const form = new FormData();
  form.append('image', file.buffer.toString('base64'));

  const url = `https://api.imgbb.com/1/upload?key=${apiKey}`;
  const resp = await axios.post(url, form, { headers: form.getHeaders(), maxContentLength: Infinity });
  if (!resp.data || !resp.data.data) throw new Error('ImgBB upload failed');

  const d = resp.data.data;
  // store in media table
  const result = await query('INSERT INTO media (provider, provider_id, url, filename, mimetype, size, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [
    'imbb',
    d.id,
    d.url,
    d.name || null,
    file.mimetype || null,
    file.size || null,
  ]);

  return { id: result.insertId, provider: 'imbb', provider_id: d.id, url: d.url };
}

module.exports = { uploadToImgBB };
