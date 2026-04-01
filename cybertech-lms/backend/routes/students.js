const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Enrollment } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────────────────
// GET /api/students  — list all students with enrollment count
// ─────────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { role: 'student' };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('-password')
      .populate('enrolledCourses', 'title category')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    res.json({ success: true, total, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/students/:id  — single student with enrollments
// ─────────────────────────────────────────────────────────────
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const student = await User.findOne({ _id: id, role: 'student' })
      .select('-password')
      .populate('enrolledCourses', 'title category price');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const enrollments = await Enrollment.find({ user: id })
      .populate('course', 'title category');

    res.json({ success: true, student, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/students  — admin: create student
// ─────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password = 'Student@123', phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const student = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,   // auto-hashed by pre-save hook
      phone,
      role: 'student',
    });

    // Remove password from response
    const result = student.toObject();
    delete result.password;

    res.status(201).json({ success: true, message: 'Student created successfully', student: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/students/:id  — admin: update student
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    // Never allow changing role to admin via this endpoint
    const { password, role, ...updates } = req.body;

    const student = await User.findOneAndUpdate(
      { _id: id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/students/:id/toggle-status  — activate / deactivate
// ─────────────────────────────────────────────────────────────
router.patch('/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const student = await User.findOne({ _id: id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.isActive = !student.isActive;
    await student.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `Student ${student.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: student.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/students/:id  — admin: delete student
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const student = await User.findOneAndDelete({ _id: id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Clean up enrollments
    await Enrollment.deleteMany({ user: id });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
