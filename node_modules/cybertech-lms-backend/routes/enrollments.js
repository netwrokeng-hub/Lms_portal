const express = require('express');
const router  = express.Router();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Enrollment, Payment } = require('../models/index');
const Course = require('../models/Course');
const User   = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const emailService = require('../services/emailService');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

function computeExpiry(validityMonths, from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + Number(validityMonths));
  return d;
}

function generateTempPassword(name) {
  const word = (name || 'Student').split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'Student';
  const num  = Math.floor(1000 + Math.random() * 9000);
  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}@${num}`;
}

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

// POST /api/enrollments/pay-direct  — initiate + pay in one call
router.post('/pay-direct', protect, async (req, res) => {
  try {
    const { courseId, validityMonths = 6, batchTiming, paymentMethod = 'demo', transactionId, notes } = req.body;
    if (!courseId || !isValidId(courseId)) return res.status(400).json({ success: false, message: 'Valid courseId required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing && ['approved', 'paid_pending_approval'].includes(existing.status)) {
      return res.status(400).json({ success: false, message: existing.status === 'approved' ? 'Already enrolled' : 'Enrollment under review - please wait for approval', enrollment: existing });
    }
    if (existing) await Enrollment.deleteOne({ _id: existing._id });

    const validity = [3, 6, 12].includes(Number(validityMonths)) ? Number(validityMonths) : 6;
    const amount   = course.discountPrice || course.price;

    const enrollment = await Enrollment.create({
      user: req.user._id, course: courseId, status: 'paid_pending_approval',
      validityMonths: validity, batchTiming: batchTiming || '', isActive: false,
    });

    const payment = await Payment.create({
      user: req.user._id, course: courseId, enrollment: enrollment._id,
      amount, currency: 'INR', status: 'completed', paymentMethod,
      transactionId: transactionId || `TXN_${Date.now()}`, paidAt: new Date(), notes,
    });

    enrollment.payment = payment._id;
    enrollment.updatedAt = new Date();
    await enrollment.save();

    const user = await User.findById(req.user._id).select('name email');
    emailService.sendAdminPaymentNotification({ studentName: user.name, studentEmail: user.email, courseName: course.title, amount, enrollmentId: enrollment._id }, enrollment._id).catch(console.error);
    emailService.sendStudentPaymentConfirmation({ studentName: user.name, courseName: course.title, amount, invoiceNumber: payment.invoiceNumber }, user.email, enrollment._id, user._id).catch(console.error);

    res.status(201).json({ success: true, message: 'Payment successful! Your enrollment is under review. Credentials will be sent via email once approved.', enrollment, payment: { _id: payment._id, invoiceNumber: payment.invoiceNumber, amount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/enrollments/my
router.get('/my', protect, async (req, res) => {
  try {
    await Enrollment.expireOld();
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title thumbnail category duration slug price discountPrice')
      .populate('payment', 'amount status invoiceNumber paidAt paymentMethod')
      .sort({ enrolledAt: -1 }).lean();
    res.json({ success: true, enrollments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/enrollments/check/:courseId
router.get('/check/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId })
      .populate('payment', 'amount status invoiceNumber');
    if (!enrollment) return res.json({ success: true, enrolled: false });
    res.json({ success: true, enrolled: true, enrollment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/enrollments/:id/progress
router.put('/:id/progress', protect, async (req, res) => {
  try {
    const { lessonId, progress } = req.body;
    const enrollment = await Enrollment.findOne({ _id: req.params.id, user: req.user._id });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (!enrollment.computeIsActive()) return res.status(403).json({ success: false, message: 'Course access expired or not active' });
    enrollment.completedLessons = [...new Set([...enrollment.completedLessons, lessonId])];
    enrollment.progress = Math.min(100, Math.max(0, progress));
    enrollment.lastAccessedLesson = lessonId;
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/enrollments/admin/all
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    await Enrollment.expireOld();
    const { status, search, page = 1, limit = 100 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    let enrollments = await Enrollment.find(query)
      .populate('user',       'name email phone')
      .populate('course',     'title category price discountPrice duration')
      .populate('payment',    'amount status invoiceNumber paidAt paymentMethod transactionId')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ enrolledAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    if (search) {
      const q = search.toLowerCase();
      enrollments = enrollments.filter(e => e.user?.name?.toLowerCase().includes(q) || e.user?.email?.toLowerCase().includes(q) || e.course?.title?.toLowerCase().includes(q));
    }

    const total = await Enrollment.countDocuments(query);
    const counts = await Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const statusCounts = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

    res.json({ success: true, enrollments, total, statusCounts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/enrollments/admin/approve/:id
router.put('/admin/approve/:id', protect, adminOnly, async (req, res) => {
  try {
    const { adminNotes, validityMonths } = req.body;
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const enrollment = await Enrollment.findById(req.params.id).populate('user', 'name email').populate('course', 'title');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (enrollment.status !== 'paid_pending_approval') return res.status(400).json({ success: false, message: `Cannot approve status: ${enrollment.status}` });

    const user = enrollment.user, course = enrollment.course;
    const validity = Number(validityMonths) || enrollment.validityMonths || 6;
    const startDate = new Date();
    const expiresAt = computeExpiry(validity, startDate);

    const tempPassword = generateTempPassword(user.name);
    const hashedPass   = await bcrypt.hash(tempPassword, 12);
    await User.findByIdAndUpdate(user._id, { password: hashedPass });

    enrollment.status = 'approved'; enrollment.isActive = true;
    enrollment.approvedAt = new Date(); enrollment.approvedBy = req.user._id;
    enrollment.adminNotes = adminNotes || ''; enrollment.validityMonths = validity;
    enrollment.startDate = startDate; enrollment.expiresAt = expiresAt;
    enrollment.credentialsSent = true; enrollment.credentialsSentAt = new Date();
    enrollment.updatedAt = new Date();
    await enrollment.save();

    await User.findByIdAndUpdate(user._id, { $addToSet: { enrolledCourses: enrollment.course._id || enrollment.course } });
    await Course.findByIdAndUpdate(enrollment.course._id || enrollment.course, { $inc: { enrolledCount: 1 } });

    emailService.sendApprovalWithCredentials({ studentName: user.name, courseName: course.title, email: user.email, tempPassword, startDate: fmtDate(startDate), expiresAt: fmtDate(expiresAt), validityMonths: validity, portalUrl: `${process.env.CLIENT_URL}/student` }, user.email, enrollment._id, user._id).catch(console.error);

    const updated = await Enrollment.findById(enrollment._id).populate('user', 'name email phone').populate('course', 'title category').populate('payment', 'amount status invoiceNumber').lean();
    res.json({ success: true, message: `Enrollment approved! Credentials sent to ${user.email}`, enrollment: updated, credentials: { email: user.email, tempPassword } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/enrollments/admin/reject/:id
router.put('/admin/reject/:id', protect, adminOnly, async (req, res) => {
  try {
    const { reason, refundInfo } = req.body;
    if (!isValidId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const enrollment = await Enrollment.findById(req.params.id).populate('user', 'name email').populate('course', 'title');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    if (!['paid_pending_approval', 'approved'].includes(enrollment.status)) return res.status(400).json({ success: false, message: `Cannot reject status: ${enrollment.status}` });

    enrollment.status = 'rejected'; enrollment.isActive = false;
    enrollment.rejectedAt = new Date(); enrollment.rejectedBy = req.user._id;
    enrollment.rejectionReason = reason || 'Not specified'; enrollment.updatedAt = new Date();
    await enrollment.save();

    if (enrollment.payment) await Payment.findByIdAndUpdate(enrollment.payment, { status: 'refunded' });

    emailService.sendRejectionEmail({ studentName: enrollment.user.name, courseName: enrollment.course.title, reason, refundInfo }, enrollment.user.email, enrollment._id, enrollment.user._id).catch(console.error);

    const updated = await Enrollment.findById(enrollment._id).populate('user', 'name email phone').populate('course', 'title category').populate('payment', 'amount status').lean();
    res.json({ success: true, message: 'Enrollment rejected. Email sent.', enrollment: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/enrollments/admin/extend/:id
router.put('/admin/extend/:id', protect, adminOnly, async (req, res) => {
  try {
    const { additionalMonths = 3 } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Not found' });
    const base = enrollment.expiresAt || new Date();
    enrollment.expiresAt = computeExpiry(additionalMonths, base);
    enrollment.validityMonths = (enrollment.validityMonths || 6) + Number(additionalMonths);
    if (enrollment.status === 'expired') { enrollment.status = 'approved'; enrollment.isActive = true; }
    enrollment.updatedAt = new Date();
    await enrollment.save();
    res.json({ success: true, message: `Extended by ${additionalMonths} months`, enrollment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/enrollments/admin/resend-credentials/:id
router.post('/admin/resend-credentials/:id', protect, adminOnly, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('user', 'name email').populate('course', 'title');
    if (!enrollment || enrollment.status !== 'approved') return res.status(400).json({ success: false, message: 'Can only resend for approved enrollments' });
    const tempPassword = generateTempPassword(enrollment.user.name);
    const hashedPass   = await bcrypt.hash(tempPassword, 12);
    await User.findByIdAndUpdate(enrollment.user._id, { password: hashedPass });
    await emailService.sendApprovalWithCredentials({ studentName: enrollment.user.name, courseName: enrollment.course.title, email: enrollment.user.email, tempPassword, startDate: fmtDate(enrollment.startDate || enrollment.approvedAt), expiresAt: fmtDate(enrollment.expiresAt), validityMonths: enrollment.validityMonths, portalUrl: `${process.env.CLIENT_URL}/student` }, enrollment.user.email, enrollment._id, enrollment.user._id);
    res.json({ success: true, message: `Credentials resent to ${enrollment.user.email}`, credentials: { email: enrollment.user.email, tempPassword } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/enrollments/admin/expiring
router.get('/admin/expiring', protect, adminOnly, async (req, res) => {
  try {
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    const enrollments = await Enrollment.find({ status: 'approved', expiresAt: { $lte: sevenDays, $gte: new Date() } }).populate('user', 'name email').populate('course', 'title').lean();
    res.json({ success: true, enrollments, count: enrollments.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
