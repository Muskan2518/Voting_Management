// handlers/getElection.js
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const Election = require('../models/election');

const router = express.Router();
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

router.get('/get-election', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });

    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ message: 'Missing election code' });
    }

    const election = await Election.findOne({ code }).lean();
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const isCreator = decoded.id === election.created_by.toString();
    let contestants = [];

    // Always include name; conditionally include vote_count
    if (Array.isArray(election.contestants)) {
      contestants = election.contestants.map(c => {
        const result = {
          _id: c._id,
          name: c.name
        };
        if (isCreator || election.status !== 'active') {
          result.vote_count = c.vote_count;
        }
        return result;
      });
    }

    res.json({
      election: {
        _id: election._id,
        title: election.title,
        description: election.description,
        code: election.code,
        created_by: election.created_by,
        created_at: election.createdAt,
        updated_at: election.updatedAt,
        total_votes_allowed: election.total_votes_allowed,
        total_votes_cast: election.total_votes_cast || 0,
        status: election.status,
        start_date: election.start_date,
        end_date: election.end_date,
        contestants
      }
    });

  } catch (err) {
    console.error('Get election error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
