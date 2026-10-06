// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
let students = require('../data/students');

// 1. GET /students - View all students
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: students
  });
});

// 2. GET /students/:id - View student by ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${id} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// 3. POST /students - Create new student
router.post('/', (req, res) => {
  const { name, course } = req.body;

  // Input Validation (400 Bad Request)
  if (!name || !course) {
    return res.status(400).json({
      success: false,
      message: 'Name and course are required fields'
    });
  }

  const newStudent = {
    id: students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1,
    name,
    course
  };

  students.push(newStudent);

  res.status(201).json({
    success: true,
    message: 'New student created successfully',
    data: newStudent
  });
});

// 4. PUT /students/:id - Update student info
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, course } = req.body;

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${id} not found`
    });
  }

  if (name) student.name = name;
  if (course) student.course = course;

  res.status(200).json({
    success: true,
    message: 'Student information updated successfully',
    data: student
  });
});

// 5. DELETE /students/:id - Remove student
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = students.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Student with ID ${id} not found`
    });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
    data: deletedStudent
  });
});

module.exports = router;