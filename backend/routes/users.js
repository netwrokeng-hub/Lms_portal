// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses', 'title thumbnail category slug');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
