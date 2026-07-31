const multer = require('multer');
const path = require('path');

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save all videos into the uploads/ folder
  },
  filename: (req, file, cb) => {
    // e.g. 1721904123456-lecture1.mp4 — timestamp avoids name collisions
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// Only allow video files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (mp4, webm, ogg) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max per video
});

module.exports = upload;