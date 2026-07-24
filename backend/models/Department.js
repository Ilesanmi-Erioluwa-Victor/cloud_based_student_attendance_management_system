const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
      required: [true, 'Faculty is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);