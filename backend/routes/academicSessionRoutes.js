const express = require('express');
const router = express.Router();
const { getSessions, getSessionById, createSession, updateSession, deleteSession, setCurrentSession } = require('../controllers/academicSessionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', getSessions);
router.get('/:id', getSessionById);
router.post('/', protect, authorizeRoles('admin'), createSession);
router.put('/:id', protect, authorizeRoles('admin'), updateSession);
router.patch('/:id/set-current', protect, authorizeRoles('admin'), setCurrentSession);
router.delete('/:id', protect, authorizeRoles('admin'), deleteSession);

module.exports = router;
