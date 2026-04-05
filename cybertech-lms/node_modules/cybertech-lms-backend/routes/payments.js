const express = require('express');
const router = express.Router();
const { Payment, Enrollment } = require('../models/index');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Demo payment (no real gateway)
router.post('/demo', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const payment = await Payment.create({
      user: req.user._id,
      course: courseId,
      amount: course.discountPrice || course.price,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'demo',
      transactionId: 'DEMO_' + Date.now()
    });

    // Auto enroll
    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!existing) {
      await Enrollment.create({ user: req.user._id, course: courseId, paymentId: payment._id });
      await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: courseId } });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
    }

    res.json({ success: true, message: 'Payment successful! You are now enrolled.', payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Razorpay order creation (structure)
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    const amount = (course.discountPrice || course.price) * 100; // in paise
    // In production: use Razorpay SDK to create order
    res.json({
      success: true,
      orderId: 'order_' + Date.now(),
      amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my payments
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).populate('course', 'title thumbnail');
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
