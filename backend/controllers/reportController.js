const AttendanceRecord = require('../models/AttendanceRecord');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const AttendanceSession = require('../models/AttendanceSession');
const asyncHandler = require('express-async-handler');
const { sendLowAttendanceAlert } = require('../config/brevo');

const getCourseReport = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const enrollments = await Enrollment.find({ course: courseId }).populate(
    'student',
    'fullName email matricNumber level'
  );

  const totalSessions = await AttendanceSession.countDocuments({
    course: courseId,
    isActive: false,
  });

  const report = await Promise.all(
    enrollments.map(async (enrollment) => {
      const records = await AttendanceRecord.find({
        student: enrollment.student._id,
        course: courseId,
      });

      const sessionsPresent = records.filter((r) => r.status === 'Present').length;
      const sessionsAbsent = records.filter((r) => r.status === 'Absent').length;
      const percentage = totalSessions > 0 ? Math.round((sessionsPresent / totalSessions) * 100) : 0;

      return {
        student: {
          id: enrollment.student._id,
          fullName: enrollment.student.fullName,
          email: enrollment.student.email,
          matricNumber: enrollment.student.matricNumber,
          level: enrollment.student.level,
        },
        totalSessions,
        sessionsPresent,
        sessionsAbsent,
        percentage,
      };
    })
  );

  report.sort((a, b) => a.percentage - b.percentage);

  res.json(report);
});

const getStudentReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
    res.status(403);
    throw new Error('You can only view your own attendance report');
  }

  const enrollments = await Enrollment.find({ student: studentId }).populate(
    'course',
    'courseCode courseTitle'
  );

  const report = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalSessions = await AttendanceSession.countDocuments({
        course: enrollment.course._id,
        isActive: false,
      });

      const presentCount = await AttendanceRecord.countDocuments({
        student: studentId,
        course: enrollment.course._id,
        status: 'Present',
      });

      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

      return {
        course: {
          id: enrollment.course._id,
          courseCode: enrollment.course.courseCode,
          courseTitle: enrollment.course.courseTitle,
        },
        totalSessions,
        sessionsPresent: presentCount,
        percentage,
      };
    })
  );

  res.json(report);
});

const getInstitutionSummary = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const totalLecturers = await User.countDocuments({ role: 'lecturer', isActive: true });
  const totalCourses = await Course.countDocuments();

  const attendanceStats = await AttendanceRecord.aggregate([
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        presentRecords: {
          $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
        },
      },
    },
  ]);

  const averageAttendance =
    attendanceStats.length > 0
      ? Math.round((attendanceStats[0].presentRecords / attendanceStats[0].totalRecords) * 100)
      : 0;

  res.json({
    totalStudents,
    totalLecturers,
    totalCourses,
    averageAttendance,
  });
});

const sendAlerts = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const threshold = parseInt(req.query.threshold, 10) || 75;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const enrollments = await Enrollment.find({ course: courseId }).populate(
    'student',
    'fullName email'
  );

  const totalSessions = await AttendanceSession.countDocuments({
    course: courseId,
    isActive: false,
  });

  let alertsSent = 0;

  await Promise.all(
    enrollments.map(async (enrollment) => {
      const presentCount = await AttendanceRecord.countDocuments({
        student: enrollment.student._id,
        course: courseId,
        status: 'Present',
      });

      const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

      if (percentage < threshold) {
        try {
          await sendLowAttendanceAlert(
            enrollment.student.email,
            enrollment.student.fullName,
            course.courseCode,
            percentage
          );
          alertsSent += 1;
        } catch (err) {
          console.error(`Alert email failed for ${enrollment.student.email}:`, err.message);
        }
      }
    })
  );

  res.json({ alertsSent });
});

module.exports = { getCourseReport, getStudentReport, getInstitutionSummary, sendAlerts };