const Department = require('../models/Department');
const asyncHandler = require('express-async-handler');

const getDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.faculty) filter.faculty = req.query.faculty;

  const departments = await Department.find(filter).populate('faculty', 'name code');
  res.json(departments);
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('faculty', 'name code');
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json(department);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json(department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json(department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.json({ message: 'Department deleted successfully' });
});

module.exports = { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment };