const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Trainer } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────────────────
// GET /api/trainers  — public: list all active trainers
// ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name:           { $regex: search, $options: 'i' } },
        { designation:    { $regex: search, $options: 'i' } },
        { specializations:{ $in:  [new RegExp(search, 'i')] } },
      ];
    }

    const trainers = await Trainer.find(query).sort({ studentsCount: -1 }).lean();
    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/trainers/all  — admin: all trainers including inactive
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/trainers/:id  — single trainer
// ─────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
    const trainer = await Trainer.findById(id).lean();
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/trainers  — admin: create trainer
// ─────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, designation, experience, bio, specializations, certifications, linkedIn } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Trainer name is required' });

    // Parse array fields that might come as comma-separated strings
    const parseArray = (val) =>
      Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(v => v.trim()).filter(Boolean) : []);

    const trainer = await Trainer.create({
      name: name.trim(),
      email, phone, designation, experience, bio, linkedIn,
      specializations: parseArray(specializations),
      certifications:  parseArray(certifications),
      rating: 4.5,
      studentsCount: 0,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Trainer created successfully', trainer });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered for another trainer' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/trainers/:id  — admin: update trainer
// ─────────────────────────────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const updates = { ...req.body };

    // Parse array fields
    const parseArray = (val) =>
      Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(v => v.trim()).filter(Boolean) : undefined);

    if (updates.specializations !== undefined) updates.specializations = parseArray(updates.specializations);
    if (updates.certifications  !== undefined) updates.certifications  = parseArray(updates.certifications);

    const trainer = await Trainer.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    res.json({ success: true, message: 'Trainer updated successfully', trainer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/trainers/:id  — admin: delete trainer
// ─────────────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

    const trainer = await Trainer.findByIdAndDelete(id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    res.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
