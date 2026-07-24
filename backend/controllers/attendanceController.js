const AttendanceSession = require('../models/AttendanceSession');
const AttendanceRecord = require('../models/AttendanceRecord');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');

const generateSessionCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const startSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (
    req.user.role !== 'admin' &&
    course.lecturer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('You are not the lecturer for this course');
  }

  let sessionCode;
  let isUnique = false;
  while (!isUnique) {
    sessionCode = generateSessionCode();
    const existing = await AttendanceSession.findOne({ sessionCode, isActive: true });
    if (!existing) isUnique = true;
  }

  const session = await AttendanceSession.create({
    course: courseId,
    lecturer: req.user._id,
    sessionCode,
    startTime: new Date(),
    isActive: true,
  });

  res.status(201).json(session);
});

const closeSession = asyncHandler(async (req, res) => {
  const session = await AttendanceSession.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Attendance session not found');
  }

  if (
    req.user.role !== 'admin' &&
    session.lecturer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to close this session');
  }

  session.endTime = new Date();
  session.isActive = false;
  await session.save();

  const enrollments = await Enrollment.find({ course: session.course });
  for (const enrollment of enrollments) {
    const existing = await AttendanceRecord.findOne({
      attendanceSession: session._id,
      student: enrollment.student,
    });
    if (!existing) {
      await AttendanceRecord.create({
        attendanceSession: session._id,
        student: enrollment.student,
        course: session.course,
        status: 'Absent',
      });
    }
  }

  res.json(session);
});

const markAttendance = asyncHandler(async (req, res) => {
  const { sessionCode } = req.body;

  const session = await AttendanceSession.findOne({ sessionCode, isActive: true });
  if (!session) {
    res.status(404);
    throw new Error('Invalid or expired session code');
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: session.course,
  });
  if (!enrollment) {
    res.status(400);
    throw new Error('You are not enrolled in this course');
  }

  const alreadyMarked = await AttendanceRecord.findOne({
    attendanceSession: session._id,
    student: req.user._id,
  });
  if (alreadyMarked) {
    res.status(400);
    throw new Error('Attendance already marked for this session');
  }

  const record = await AttendanceRecord.create({
    attendanceSession: session._id,
    student: req.user._id,
    course: session.course,
    status: 'Present',
  });

  res.status(201).json(record);
});

const getCourseSessions = asyncHandler(async (req, res) => {
  const sessions = await AttendanceSession.find({ course: req.params.courseId })
    .populate('lecturer', 'fullName');

  const sessionsWithCounts = await Promise.all(
    sessions.map(async (session) => {
      const records = await AttendanceRecord.find({ attendanceSession: session._id });
      const totalPresent = records.filter((r) => r.status === 'Present').length;
      const totalAbsent = records.filter((r) => r.status === 'Absent').length;
      return {
        ...session.toObject(),
        totalPresent,
        totalAbsent,
      };
    })
  );

  res.json(sessionsWithCounts);
});

const getMyHistory = asyncHandler(async (req, res) => {
  const filter = { student: req.user._id };
  if (req.query.course) filter.course = req.query.course;

  const records = await AttendanceRecord.find(filter)
    .populate('course', 'courseCode courseTitle')
    .populate('attendanceSession', 'sessionCode startTime')
    .sort({ markedAt: -1 });

  res.json(records);
});

module.exports = {
  startSession,
  closeSession,
  markAttendance,
  getCourseSessions,
  getMyHistory,
};