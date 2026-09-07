const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');
const postController = require('../controllers/postController');
const asyncHandler = require('../middleware/asyncHandler');

router.get('/', asyncHandler(postController.list));
router.get('/:slug', asyncHandler(postController.getBySlug));
// admin routes
router.post('/', authenticate, adminOnly, asyncHandler(postController.create));
router.put('/:id', authenticate, adminOnly, asyncHandler(postController.update));
router.delete('/:id', authenticate, adminOnly, asyncHandler(postController.remove));

module.exports = router;
