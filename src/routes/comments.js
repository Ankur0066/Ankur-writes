const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/posts/:postId/comments
router.post('/:postId/comments', asyncHandler(commentController.create));
// GET /api/posts/:postId/comments
router.get('/:postId/comments', asyncHandler(commentController.list));

module.exports = router;
