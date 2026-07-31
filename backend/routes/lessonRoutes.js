const express = require('express');
const router = express.Router();
const { addLesson } = require('../controllers/lessonController');
const { verifyToken, requireInstructor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Instructor uploads a video lesson to a specific course
router.post(
  '/:courseId',
  verifyToken,
  requireInstructor,
  upload.single('video'),
  addLesson
);

module.exports = router;