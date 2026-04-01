// routes/batches.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId, 'batchTimings title');
    res.json({ success: true, batches: course?.batchTimings || [] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/course/:courseId', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.courseId,
      { $push: { batchTimings: req.body } },
      { new: true }
    );
    res.json({ success: true, batches: course.batchTimings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
