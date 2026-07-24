const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId, academicSession } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  try {
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      academicSession,
    });
    res.status(201).json(enrollment);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400);
      throw new Error('Already enrolled in this course');
    }
    throw err;
  }
});

const getMyEnrollments = asyncHandler(async (req, res) => {
  const filter = { student: req.user._id };
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;

  const enrollments = await Enrollment.find(filter)
    .populate('course')
    .populate('academicSession', 'name');

  res.json(enrollments);
});

const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (req.user.role === 'lecturer' && course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to view enrollments for this course');
  }

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('student', 'fullName email matricNumber level');

  res.json(enrollments);
});

const deleteEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found');
  }

  if (
    req.user.role !== 'admin' &&
    enrollment.student.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this enrollment');
  }

  await enrollment.deleteOne();
  res.json({ message: 'Enrollment deleted successfully' });
});

module.exports = { enrollCourse, getMyEnrollments, getCourseEnrollments, deleteEnrollment };