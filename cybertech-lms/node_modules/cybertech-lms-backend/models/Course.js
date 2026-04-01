const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  duration: String,
  order: Number,
  isFree: { type: Boolean, default: false }
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
  order: Number
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  category: {
    type: String,
    enum: ['cybersecurity', 'networking', 'vmware', 'nutanix', 'aws', 'gcp', 'datacenter', 'firewall', 'hardware'],
    required: true
  },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  price: { type: Number, required: true },
  discountPrice: Number,
  duration: String,
  thumbnail: { type: String, default: '' },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  trainerName: String,
  modules: [moduleSchema],
  syllabus: [{ topic: String, subtopics: [String] }],
  batchTimings: [{
    day: String,
    time: String,
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'] },
    startDate: Date,
    seats: Number,
    availableSeats: Number
  }],
  tags: [String],
  requirements: [String],
  whatYouLearn: [String],
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  totalReviews: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  certificationIncluded: { type: Boolean, default: true },
  language: { type: String, default: 'English' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', courseSchema);
