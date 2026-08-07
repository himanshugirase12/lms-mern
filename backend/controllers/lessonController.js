const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const fs = require('fs');
const path = require('path');
// @route  POST /api/lessons/:courseId
// @access Instructor only (must own the course)
const addLesson = async (req, res) => {
  try {
    const { title, order } = req.body;
    const { courseId } = req.params;

    if (!title || !req.file) {
      return res.status(400).json({ message: 'Title and video file are required' });
    }

    // Confirm the course exists AND belongs to this instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not own this course' });
    }

    // Create the lesson, storing the path multer saved the file to
    const lesson = await Lesson.create({
      title,
      videoPath: req.file.path.replace(/\\/g, '/'), // e.g. "uploads/1721904123456-lecture1.mp4"
      course: courseId,
      order: order || 0,
    });

    // Add this lesson's ID to the course's lessons array
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const streamVideo = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Access control: must be the course owner OR an enrolled student
    const course = await Course.findById(lesson.course);
    const isOwner = course.instructor.toString() === req.user.id;

    if (!isOwner) {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: lesson.course,
      });
      if (!enrollment) {
        return res.status(403).json({ message: 'You do not have access to this video' });
      }
    }
  
      const videoPath = path.join(__dirname, '..', lesson.videoPath);
  
      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ message: 'Video file not found on server' });
      }
  
      const videoSize = fs.statSync(videoPath).size;
      const range = req.headers.range;
  
      if (!range) {
        // No range header — just send the whole file (rare case, e.g. direct download)
        res.writeHead(200, {
          'Content-Length': videoSize,
          'Content-Type': 'video/mp4',
        });
        return fs.createReadStream(videoPath).pipe(res);
      }
  
      // Parse the range header, e.g. "bytes=0-"
      const CHUNK_SIZE = 10 ** 6; // 1MB per chunk
      
      const parts = range.replace(/bytes=/, '').split('-');
      const start = Number(parts[0]);
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
  
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
      });
  
      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.pipe(res);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  module.exports = { addLesson, streamVideo };
