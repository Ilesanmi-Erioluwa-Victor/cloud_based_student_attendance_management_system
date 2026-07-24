require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Faculty = require('./models/Faculty');
const Department = require('./models/Department');
const AcademicSession = require('./models/AcademicSession');
const Semester = require('./models/Semester');
const Course = require('./models/Course');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col.name);
    }
    console.log('Dropped all collections');

    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@attendance.com',
      password: 'Admin123!',
      role: 'admin',
      isActive: true,
    });
    console.log('Admin created: admin@attendance.com / Admin123!');

    const faculty = await Faculty.create({ name: 'Faculty of Science', code: 'SCI' });
    console.log('Faculty created: Faculty of Science');

    const dept = await Department.create({ name: 'Computer Science', code: 'CSC', faculty: faculty._id });
    console.log('Department created: Computer Science');

    const lecturer = await User.create({
      fullName: 'Dr. John Lecturer',
      email: 'lecturer@attendance.com',
      password: 'Lect123!',
      role: 'lecturer',
      staffId: 'STF001',
      department: dept._id,
      isActive: true,
    });
    console.log('Lecturer created: lecturer@attendance.com / Lect123!');

    const session = await AcademicSession.create({
      name: '2025/2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-08-31'),
      isActive: true,
    });
    console.log('Academic session created: 2025/2026');

    const sem = await Semester.create({
      name: 'First',
      academicSession: session._id,
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-01-31'),
      isActive: true,
    });
    console.log('Semester created: First');

    const course = await Course.create({
      courseCode: 'CSC301',
      courseTitle: 'Data Structures',
      unit: 3,
      department: dept._id,
      level: 300,
      semester: 'First',
      lecturer: lecturer._id,
      academicSession: session._id,
    });
    console.log('Course created: CSC301 - Data Structures');

    const student = await User.create({
      fullName: 'Jane Student',
      email: 'student@attendance.com',
      password: 'Stud123!',
      role: 'student',
      matricNumber: 'CSC2024-001',
      department: dept._id,
      level: 300,
      isActive: true,
    });
    console.log('Student created: student@attendance.com / Stud123!');

    console.log('\n========== SEED COMPLETE ==========');
    console.log('Admin:    admin@attendance.com / Admin123!');
    console.log('Lecturer: lecturer@attendance.com / Lect123!');
    console.log('Student:  student@attendance.com / Stud123!');
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
