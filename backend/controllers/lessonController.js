const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

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
      videoPath: req.file.path,
      course: courseId,
      order: order || 0,
    });

    // Add this lesson's ID to the course's lessons array
    course.lessons.push(lesson._id);
    await course.save();

    res.status(201).json(lesson);
  } catch (err) {
    console.error('Add lesson error:', JSON.stringify(err, null, 2));
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const streamVideo = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

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

    // Cloudinary URLs support range requests natively — just redirect to it
    res.redirect(lesson.videoPath);
  } catch (err) {
    console.error('Stream error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
  
  module.exports = { addLesson, streamVideo };
