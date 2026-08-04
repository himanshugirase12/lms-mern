const express = require('express');
const router = express.Router();
const { enrollInCourse, getLessonsByCourse, markLessonComplete, getMyEnrollments } = require('../controllers/enrollmentController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/free/:courseId', verifyToken, enrollInCourse);
router.get('/:courseId/lessons', verifyToken, getLessonsByCourse);
router.patch('/:courseId/progress/:lessonId', verifyToken, markLessonComplete);
router.get('/my-courses', verifyToken, getMyEnrollments);
module.exports = router;



