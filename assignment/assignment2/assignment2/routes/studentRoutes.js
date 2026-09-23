
const express = require("express");

const router = express.Router();

const students = require("../data/students");

// Helper function to validate a positive integer ID
const isValidId = (id) => {
  return /^\d+$/.test(id) && Number(id) > 0;
};

// 1. GET /students
// Get all students
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// 2. GET /students/:id
// Get a student by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer"
    });
  }

  const student = students.find(
    (s) => s.id === Number(id)
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// 3. POST /students
// Add a new student
router.post("/", (req, res) => {
  const { name, age, course, email } = req.body;

  // Validate required fields
  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isInteger(age) ||
    age <= 0 ||
    typeof course !== "string" ||
    !course.trim() ||
    typeof email !== "string" ||
    !email.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Name, positive integer age, course, and email are required"
    });
  }

  const newId =
    students.length > 0
      ? Math.max(...students.map((s) => s.id)) + 1
      : 1;

  const newStudent = {
    id: newId,
    name: name.trim(),
    age: age,
    course: course.trim(),
    email: email.trim()
  };

  students.push(newStudent);

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: newStudent
  });
});

// 4. PUT /students/:id
// Update an existing student
router.put("/:id", (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer"
    });
  }

  const student = students.find(
    (s) => s.id === Number(id)
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  const { name, age, course, email } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isInteger(age) ||
    age <= 0 ||
    typeof course !== "string" ||
    !course.trim() ||
    typeof email !== "string" ||
    !email.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Name, positive integer age, course, and email are required"
    });
  }

  student.name = name.trim();
  student.age = age;
  student.course = course.trim();
  student.email = email.trim();

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student
  });
});

// 5. DELETE /students/:id
// Delete a student
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({
      success: false,
      message: "Student ID must be a positive integer"
    });
  }

  const index = students.findIndex(
    (s) => s.id === Number(id)
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Student not found"
    });
  }

  const deletedStudent = students.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    data: deletedStudent
  });
});

module.exports = router;