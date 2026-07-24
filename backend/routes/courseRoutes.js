const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorizeRoles('admin'), createCourse);
router.put('/:id', protect, authorizeRoles('admin'), updateCourse);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCourse);

module.exports = router;
