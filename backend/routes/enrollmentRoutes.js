const express = require('express');
const router = express.Router();
const { enrollInCourse, getLessonsByCourse, markLessonComplete } = require('../controllers/enrollmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/free/:courseId', verifyToken, enrollInCourse);
router.get('/:courseId/lessons', verifyToken, getLessonsByCourse);
router.patch('/:courseId/progress/:lessonId', verifyToken, markLessonComplete);
module.exports = router;



