const express = require('express');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
router.get('/', protect, admin, async (req, res) => {
  try {
    // Fetch all users but exclude their passwords
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;