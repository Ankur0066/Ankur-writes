const mediaService = require('../services/mediaService');

async function upload(req, res) {
  if (!req.file) return res.status(400).json({ message: 'file required' });
  try {
    const media = await mediaService.uploadToImgBB(req.file);
    res.status(201).json(media);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
}

module.exports = { upload };
