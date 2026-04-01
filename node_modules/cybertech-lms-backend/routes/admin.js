const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Course  = require('../models/Course');
const { Enrollment, Payment, Trainer } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin
router.use(protect, adminOnly);

// ── Dashboard stats ───────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, totalCourses, totalEnrollments, revenueResult] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Course.countDocuments({ isPublished: true }),
      Enrollment.countDocuments({ isActive: true }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    const recentEnrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title category')
      .sort({ enrolledAt: -1 })
      .limit(10)
      .lean();
    res.json({
      success: true,
      stats: {
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalRevenue: revenueResult[0]?.total || 0,
        recentEnrollments,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── All enrollments ───────────────────────────────────────
router.get('/enrollments', async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user',   'name email phone')
      .populate('course', 'title category price')
      .sort({ enrolledAt: -1 })
      .lean();
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── All payments ──────────────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user',   'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Assign course to user ────────────────────────────────
router.post('/assign-course', async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'userId and courseId are required' });
    }
    await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      { user: userId, course: courseId, isActive: true },
      { upsert: true, new: true }
    );
    await User.findByIdAndUpdate(userId, { $addToSet: { enrolledCourses: courseId } });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    res.json({ success: true, message: 'Course assigned successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
