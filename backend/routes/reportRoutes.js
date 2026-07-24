const express = require('express');
const router = express.Router();
const { getCourseReport, getStudentReport, getInstitutionSummary, sendAlerts } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/course/:courseId', protect, authorizeRoles('lecturer', 'admin'), getCourseReport);
router.get('/student/:studentId', protect, getStudentReport);
router.get('/institution-summary', protect, authorizeRoles('admin'), getInstitutionSummary);
router.post('/course/:courseId/send-alerts', protect, authorizeRoles('lecturer', 'admin'), sendAlerts);

module.exports = router;
