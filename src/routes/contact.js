const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// public contact form endpoint (sends email and stores in inbox_entries)
router.post('/', asyncHandler(contactController.send));

// admin endpoints to list and read entries
router.get('/', authenticate, adminOnly, asyncHandler(contactController.list));
router.get('/:id', authenticate, adminOnly, asyncHandler(contactController.get));

module.exports = router;
