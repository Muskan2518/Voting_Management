// routes/voteHistory.js
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const Vote = require('../models/votes');
const Election = require('../models/election');

const router = express.Router();
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

router.get('/vote-history', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });
    const userId = decoded.id;

    const votes = await Vote.find({ user_id: userId }).lean();

    const history = await Promise.all(
      votes.map(async (vote) => {
        const election = await Election.findById(vote.election_id).lean();
        const contestant = election?.contestants?.id(vote.contestant_id);
        return {
          election_title: election?.title || "Unknown",
          election_code: election?.code || "Unknown",
          contestant_name: contestant?.name || "Unknown",
          cast_at: moment(vote.cast_at).format('YYYY-MM-DD:hh:mm:a')
        };
      })
    );

    res.json({ votes: history });

  } catch (err) {
    console.error('Vote history error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
