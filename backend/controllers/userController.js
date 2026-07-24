const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const users = await User.find(filter)
    .populate('department', 'name code')
    .select('-password');

  res.json(users);
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  const updatedUser = user.toObject();
  delete updatedUser.password;

  res.json(updatedUser);
});

module.exports = { getUsers, toggleUserActive };