const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/courses  — public list with filters
router.get('/', async (req, res) => {
  try {
    const { category, level, search, featured, limit = 50, page = 1 } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'all') query.category = category;
    if (level && level !== 'All') query.level = level;
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('trainer', 'name photo designation rating studentsCount')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();
    res.json({ success: true, total, page: Number(page), courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/all  — admin: all courses incl. unpublished
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('trainer', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/:id  — single course by id or slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filter = isValidId(id) ? { $or: [{ _id: id }, { slug: id }] } : { slug: id };
    const course = await Course.findOne(filter)
      .populate('trainer', 'name photo designation bio experience certifications rating studentsCount');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses  — admin: create
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, shortDescription, category, level, price, discountPrice, duration, trainer, tags, whatYouLearn, requirements, batchTimings, isFeatured, isPublished, certificationIncluded } = req.body;
    if (!title || !category || !price) {
      return res.status(400).json({ success: false, message: 'Title, category and price are required' });
    }
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Course.findOne({ slug: baseSlug });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    const course = await Course.create({
      title: title.trim(), slug, description, shortDescription, category, level,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      duration, trainer: trainer || undefined,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      whatYouLearn: Array.isArray(whatYouLearn) ? whatYouLearn : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      batchTimings: Array.isArray(batchTimings) ? batchTimings : [],
      isFeatured: isFeatured === true || isFeatured === 'true',
      isPublished: isPublished !== false && isPublished !== 'false',
      certificationIncluded: certificationIncluded !== false,
    });
    res.status(201).json({ success: true, message: 'Course created successfully', course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/courses/:id  — admin: update
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid course ID' });
    const updates = { ...req.body, updatedAt: new Date() };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice);
    if (typeof updates.tags === 'string') updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean);
    const course = await Course.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).populate('trainer', 'name');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course updated successfully', course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/courses/:id  — admin: delete
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid course ID' });
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
