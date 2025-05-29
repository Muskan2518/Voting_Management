// backend/handlers/signin.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/users'); // Adjust if your path is different
const validator = require('validator');

// Load private key for signing JWT
const privateKey = fs.readFileSync('./private_key.pem', 'utf8');

// POST /signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Incorrect credentials' });
    }

    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || ''
      },
      token,
      expires_in: 3600
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
