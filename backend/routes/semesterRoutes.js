const express = require('express');
const router = express.Router();
const { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester } = require('../controllers/semesterController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getSemesters);
router.get('/:id', getSemesterById);
router.post('/', protect, authorizeRoles('admin'), createSemester);
router.put('/:id', protect, authorizeRoles('admin'), updateSemester);
router.delete('/:id', protect, authorizeRoles('admin'), deleteSemester);

module.exports = router;
