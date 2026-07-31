const express = require('express');
const router = express.Router();
const { addLesson, streamVideo } = require('../controllers/lessonController');
const { verifyToken, requireInstructor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/:courseId', verifyToken, requireInstructor, upload.single('video'), addLesson);
router.get('/stream/:lessonId', verifyToken, streamVideo);

module.exports = router;    