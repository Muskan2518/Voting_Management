const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Election = require('../models/election');

const router = express.Router();
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

router.get('/get-all-elections', async (req, res) => {
  try {
    // Authorization check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });

    // Fetch elections created by the user
    const elections = await Election.find({ created_by: decoded.id })
      .sort({ createdAt: -1 }) // Optional: newest first
      .lean();

    res.json({ elections });
  } catch (err) {
    console.error('Get all elections error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
