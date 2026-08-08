const express = require('express');
const router = express.Router();
const { addLesson, streamVideo } = require('../controllers/lessonController');
const { verifyToken, requireInstructor } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/:courseId', verifyToken, requireInstructor, (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    if (err) {
      console.error('MULTER/CLOUDINARY UPLOAD ERROR:', err.message);
      console.error('FULL ERROR:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
    next();
  });
}, addLesson);

router.get('/stream/:lessonId', verifyToken, streamVideo);

module.exports = router;