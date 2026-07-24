const AcademicSession = require('../models/AcademicSession');
const asyncHandler = require('express-async-handler');

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await AcademicSession.find().sort({ startDate: -1 });
  res.json(sessions);
});

const getSessionById = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findById(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Academic session not found');
  }
  res.json(session);
});

const createSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.create(req.body);
  res.status(201).json(session);
});

const updateSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!session) {
    res.status(404);
    throw new Error('Academic session not found');
  }
  res.json(session);
});

const deleteSession = asyncHandler(async (req, res) => {
  const session = await AcademicSession.findByIdAndDelete(req.params.id);
  if (!session) {
    res.status(404);
    throw new Error('Academic session not found');
  }
  res.json({ message: 'Academic session deleted successfully' });
});

module.exports = { getSessions, getSessionById, createSession, updateSession, deleteSession };