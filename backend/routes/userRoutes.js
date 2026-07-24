const express = require('express');
const router = express.Router();
const { getUsers, toggleUserActive } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/', protect, authorizeRoles('admin'), getUsers);
router.patch('/:id/toggle-active', protect, authorizeRoles('admin'), toggleUserActive);

module.exports = router;
