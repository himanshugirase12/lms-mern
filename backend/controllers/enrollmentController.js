const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
// @route  POST /api/enrollments/free/:courseId
// @access Any logged-in student
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // This endpoint is only for free courses — paid ones must go through payment verification
    if (course.price > 0) {
      return res.status(400).json({
        message: 'This course requires payment. Use the payment flow to enroll.',
      });
    }

    // Prevent duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentStatus: 'free',
      progress: [],
    });

    res.status(201).json(enrollment);
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// @route  GET /api/enrollments/:courseId/lessons
// @access Only students enrolled in this specific course
const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Confirm the student is actually enrolled in this course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });

    res.status(200).json({ lessons, progress: enrollment.progress });
  } catch (err) {
    console.error('Get lessons error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// @route  PATCH /api/enrollments/:courseId/progress/:lessonId
// @access Only the enrolled student
const markLessonComplete = async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;
  
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
      });
  
      if (!enrollment) {
        return res.status(403).json({ message: 'You are not enrolled in this course' });
      }
  
      // Check if this lesson already has a progress entry
      const existingProgress = enrollment.progress.find(
        (p) => p.lesson.toString() === lessonId
      );
  
      if (existingProgress) {
        existingProgress.completed = true;
      } else {
        enrollment.progress.push({ lesson: lessonId, completed: true });
      }
  
      await enrollment.save();
  
      // Calculate percentage complete
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      const completedCount = enrollment.progress.filter((p) => p.completed).length;
      const percentComplete = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;
  
      res.status(200).json({
        message: 'Progress updated',
        progress: enrollment.progress,
        percentComplete,
      });
    } catch (err) {
      console.error('Mark complete error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };
  
  module.exports = { enrollInCourse, getLessonsByCourse, markLessonComplete };