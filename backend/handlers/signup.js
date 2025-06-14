const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/users');
const validator = require('validator');

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    if (name && name.length > 50) {
      return res.status(400).json({ message: 'Name must be under 50 characters' });
    }

    // Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ email, password_hash, name });

    // Save to DB
    await newUser.save();

    // Respond with success
    return res.status(201).json({
      user: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name || '',
        created_at: newUser.created_at.toISOString()  // ✅ USE created_at, not createdAt
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email or name already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
