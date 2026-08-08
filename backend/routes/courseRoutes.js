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
router.post('/', verifyToken, requireInstructor, (req, res, next) => {
  uploadImage.single('thumbnail')(req, res, (err) => {
    if (err) {
      console.error('MULTER/CLOUDINARY UPLOAD ERROR:', err.message);
      console.error('FULL ERROR:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
    next();
  });
}, createCourse);
router.get('/my-courses', verifyToken, requireInstructor, getInstructorCourses);

module.exports = router;