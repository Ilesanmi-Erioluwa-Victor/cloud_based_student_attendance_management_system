const express = require('express');
const router = express.Router();
const { enrollCourse, getMyEnrollments, getCourseEnrollments, deleteEnrollment } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('student'), enrollCourse);
router.get('/my-courses', protect, authorizeRoles('student'), getMyEnrollments);
router.get('/course/:courseId', protect, authorizeRoles('lecturer', 'admin'), getCourseEnrollments);
router.delete('/:id', protect, authorizeRoles('student', 'admin'), deleteEnrollment);

module.exports = router;
