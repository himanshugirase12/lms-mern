const express = require('express');
const router = express.Router();
const uploadImage = require('../middleware/uploadImageMiddleware');

const {
  createCourse,
  getInstructorCourses,
  getAllCourses,
} = require('../controllers/courseController');
const { verifyToken, requireInstructor } = require('../middleware/authMiddleware');

// Public route — anyone can browse courses
router.get('/', getAllCourses);

// Instructor-only routes — must be logged in AND be an instructor
router.post('/', verifyToken, requireInstructor, uploadImage.single('thumbnail'), createCourse);
router.get('/my-courses', verifyToken, requireInstructor, getInstructorCourses);

module.exports = router;