const express = require('express');
const router = express.Router();
const { startSession, closeSession, markAttendance, getCourseSessions, getMyHistory } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/sessions', protect, authorizeRoles('lecturer'), startSession);
router.patch('/sessions/:id/close', protect, authorizeRoles('lecturer'), closeSession);
router.post('/mark', protect, authorizeRoles('student'), markAttendance);
router.get('/sessions/course/:courseId', protect, authorizeRoles('lecturer', 'admin'), getCourseSessions);
router.get('/my-history', protect, authorizeRoles('student'), getMyHistory);

module.exports = router;
