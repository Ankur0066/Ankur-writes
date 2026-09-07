const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const postRoutes = require('./posts');
const mediaRoutes = require('./media');
const commentRoutes = require('./comments');
const contactRoutes = require('./contact');

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/media', mediaRoutes);
router.use('/posts', commentRoutes); // comment routes under /posts/:id/comments
router.use('/contact', contactRoutes);

module.exports = router;




