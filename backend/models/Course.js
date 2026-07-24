const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
    },
    courseTitle: {
      type: String,
      required: [true, 'Course title is required'],
    },
    unit: {
      type: Number,
      required: [true, 'Course unit is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    level: {
      type: Number,
    },
    semester: {
      type: String,
      enum: ['First', 'Second'],
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    academicSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
    },
    maxStudents: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);