const Course = require('../models/Course');

// @route  POST /api/courses
// @access Instructor only
const createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const thumbnail = req.file ? req.file.path : '';

    const course = await Course.create({
      title,
      description,
      price: price || 0,
      thumbnail,
      instructor: req.user.id,
    });

    res.status(201).json(course);
  } catch (err) {
    console.error('ERROR MESSAGE:', err.message);
    console.error('ERROR NAME:', err.name);
    console.error('ERROR STACK:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/courses/my-courses
// @access Instructor only
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).populate(
      'lessons'
    );
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route  GET /api/courses
// @access Public (any logged-in user, or fully public — your choice)
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name email');
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { createCourse, getInstructorCourses, getAllCourses };