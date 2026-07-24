const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');

const getFaculties = asyncHandler(async (req, res) => {
  const faculties = await Faculty.find().sort({ name: 1 });
  res.json(faculties);
});

const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json(faculty);
});

const createFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.create(req.body);
  res.status(201).json(faculty);
});

const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  res.json(faculty);
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndDelete(req.params.id);
  if (!faculty) {
    res.status(404);
    throw new Error('Faculty not found');
  }
  await Department.deleteMany({ faculty: req.params.id });
  res.json({ message: 'Faculty and associated departments deleted successfully' });
});

module.exports = { getFaculties, getFacultyById, createFaculty, updateFaculty, deleteFaculty };