const User = require('../models/User');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../config/brevo');

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, matricNumber, staffId, department, level } = req.body;

  if (role === 'admin') {
    res.status(403);
    throw new Error('Admin accounts cannot be self-registered');
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    res.status(400);
    throw new Error('Email already registered');
  }

  if (role === 'student' && matricNumber) {
    const existingMatric = await User.findOne({ matricNumber });
    if (existingMatric) {
      res.status(400);
      throw new Error('Matric number already registered');
    }
  }

  if (role === 'lecturer' && staffId) {
    const existingStaff = await User.findOne({ staffId });
    if (existingStaff) {
      res.status(400);
      throw new Error('Staff ID already registered');
    }
  }

  const user = await User.create({
    fullName,
    email,
    password,
    role,
    matricNumber: role === 'student' ? matricNumber : undefined,
    staffId: role === 'lecturer' ? staffId : undefined,
    department,
    level: role === 'student' ? level : undefined,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to the Attendance Management System',
      htmlContent: `<p>Hello ${user.fullName},</p><p>Your account has been created successfully.</p>`,
    });
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }

  res.status(201).json({
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account deactivated');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      matricNumber: user.matricNumber,
      staffId: user.staffId,
      level: user.level,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { registerUser, loginUser, getMe };