const Semester = require('../models/Semester');
const asyncHandler = require('express-async-handler');

const getSemesters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.academicSession) filter.academicSession = req.query.academicSession;

  const semesters = await Semester.find(filter).populate('academicSession', 'name');
  res.json(semesters);
});

const getSemesterById = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id).populate('academicSession', 'name');
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.json(semester);
});

const createSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.create(req.body);
  res.status(201).json(semester);
});

const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.json(semester);
});

const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByIdAndDelete(req.params.id);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.json({ message: 'Semester deleted successfully' });
});

module.exports = { getSemesters, getSemesterById, createSemester, updateSemester, deleteSemester };