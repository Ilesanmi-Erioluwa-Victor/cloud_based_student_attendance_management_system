const express = require('express');
const router = express.Router();
const { getFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty } = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getFaculties);
router.get('/:id', getFacultyById);
router.post('/', protect, authorizeRoles('admin'), createFaculty);
router.put('/:id', protect, authorizeRoles('admin'), updateFaculty);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFaculty);

module.exports = router;
