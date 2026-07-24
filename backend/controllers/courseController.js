const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const asyncHandler = require('express-async-handler');

const getCourses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.level) filter.level = parseInt(req.query.level, 10);
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.lecturer) filter.lecturer = req.query.lecturer;
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;

  const courses = await Course.find(filter)
    .populate('department', 'name code')
    .populate('lecturer', 'fullName email');

  res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('department', 'name code')
    .populate('lecturer', 'fullName email');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json(course);
});

const createCourse = asyncHandler(async (req, res) => {
  if (req.body.lecturer) {
    const lecturer = await User.findById(req.body.lecturer);
    if (!lecturer || lecturer.role !== 'lecturer') {
      res.status(400);
      throw new Error('Provided lecturer does not exist or is not a lecturer');
    }
  }

  const course = await Course.create(req.body);
  res.status(201).json(course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json(course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await Enrollment.deleteMany({ course: req.params.id });
  await AttendanceRecord.deleteMany({ course: req.params.id });
  await AttendanceSession.deleteMany({ course: req.params.id });

  res.json({ message: 'Course and associated data deleted successfully' });
});

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };