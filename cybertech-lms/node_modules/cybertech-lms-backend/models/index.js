const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────
// ENROLLMENT MODEL — Full business lifecycle
// ─────────────────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  course:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course',  required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

  // Approval workflow
  status: {
    type: String,
    enum: [
      'payment_pending',      // Student initiated, not paid yet
      'paid_pending_approval',// Payment done, waiting admin approval
      'approved',             // Admin approved → access granted
      'rejected',             // Admin rejected
      'expired',              // Course validity ended
      'cancelled',            // Student/admin cancelled
    ],
    default: 'payment_pending',
    index: true,
  },

  // Admin actions
  approvedAt:    Date,
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt:    Date,
  rejectedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: String,
  adminNotes:    String,

  // Course validity
  validityMonths: { type: Number, default: 6 },  // 3, 6, or 12
  startDate:     Date,
  expiresAt:     Date,

  // Access
  isActive:   { type: Boolean, default: false },  // true only when approved & not expired
  batchId:    String,
  batchTiming: String,

  // Progress tracking
  progress:          { type: Number, default: 0 },
  completedLessons:  [String],
  lastAccessedLesson: String,
  lastAccessedAt:    Date,

  // Credentials sent flag
  credentialsSent:  { type: Boolean, default: false },
  credentialsSentAt: Date,

  // Certificate
  certificate: {
    issued:         { type: Boolean, default: false },
    issuedAt:       Date,
    certificateUrl: String,
  },

  enrolledAt:  { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Auto-compute isActive based on status + expiry
enrollmentSchema.methods.computeIsActive = function () {
  if (this.status !== 'approved') return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Mark expired enrollments
enrollmentSchema.statics.expireOld = async function () {
  const now = new Date();
  await this.updateMany(
    { status: 'approved', expiresAt: { $lt: now } },
    { $set: { status: 'expired', isActive: false } }
  );
};

// ─────────────────────────────────────────────────────────────
// PAYMENT MODEL
// ─────────────────────────────────────────────────────────────
const paymentSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },

  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },

  status: {
    type: String,
    enum: ['initiated', 'pending', 'completed', 'failed', 'refunded'],
    default: 'initiated',
  },

  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'upi', 'bank_transfer', 'manual', 'demo'],
    default: 'demo',
  },

  transactionId:     String,
  razorpayOrderId:   String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  stripeSessionId:   String,

  // Receipt / invoice
  invoiceNumber: String,
  paidAt:        Date,
  notes:         String,

  createdAt: { type: Date, default: Date.now },
});

// Auto-generate invoice number
paymentSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// ─────────────────────────────────────────────────────────────
// TRAINER MODEL
// ─────────────────────────────────────────────────────────────
const trainerSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, sparse: true },
  phone:           String,
  photo:           { type: String, default: '' },
  designation:     String,
  experience:      String,
  bio:             String,
  specializations: [String],
  certifications:  [String],
  linkedIn:        String,
  coursesHandled:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  rating:          { type: Number, default: 4.8 },
  studentsCount:   { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  createdAt:       { type: Date, default: Date.now },
});

// ─────────────────────────────────────────────────────────────
// MATERIAL MODEL
// ─────────────────────────────────────────────────────────────
const materialSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  title:       { type: String, required: true },
  description: String,
  type:        { type: String, enum: ['pdf','video','ppt','zip','link','doc','other'], default: 'pdf' },
  fileUrl:     String,
  fileName:    String,
  fileSize:    String,
  isPublic:    { type: Boolean, default: false },
  module:      String,
  order:       { type: Number, default: 0 },
  uploadedAt:  { type: Date, default: Date.now },
});

// ─────────────────────────────────────────────────────────────
// EMAIL LOG MODEL  (track all sent emails)
// ─────────────────────────────────────────────────────────────
const emailLogSchema = new mongoose.Schema({
  to:         { type: String, required: true },
  subject:    { type: String, required: true },
  type:       { type: String, enum: ['approval','rejection','payment_received','credentials','expiry_warning','admin_notification'], required: true },
  status:     { type: String, enum: ['sent','failed','pending'], default: 'pending' },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  error:      String,
  sentAt:     { type: Date, default: Date.now },
});

module.exports = {
  Enrollment: mongoose.model('Enrollment', enrollmentSchema),
  Payment:    mongoose.model('Payment',    paymentSchema),
  Trainer:    mongoose.model('Trainer',    trainerSchema),
  Material:   mongoose.model('Material',   materialSchema),
  EmailLog:   mongoose.model('EmailLog',   emailLogSchema),
};
