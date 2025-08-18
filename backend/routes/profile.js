const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get public profile information (no authentication required)
router.get('/', async (req, res) => {
  try {
    // Find the admin user (assuming there's only one admin for a portfolio site)
    const user = await User.findOne({ role: 'admin' }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Return public profile data
    res.json({
      name: user.fullName || user.username,
      email: user.email,
      bio: user.bio || '',
      position: user.position || '',
      location: user.location || '',
      website: user.website || '',
      profilePhoto: user.profilePhoto || null,
      // Don't include private information like phone numbers
    });

  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
