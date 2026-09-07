const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticate, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// upload media (admin only)
router.post('/upload', authenticate, adminOnly, upload.single('file'), asyncHandler(mediaController.upload));

module.exports = router;
