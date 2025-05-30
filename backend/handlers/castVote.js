const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const Election = require('../models/election');
const Vote = require('../models/votes');
const User = require('../models/users'); // Assuming you have this model

const router = express.Router();
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

router.post('/cast-vote', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });
    const userId = decoded.id;

    const { election_code, contestant_id } = req.body;

    if (!election_code || !contestant_id) {
      return res.status(400).json({ message: 'Missing election_code or contestant_id' });
    }

    const election = await Election.findOne({ code: election_code });
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const now = new Date();
    if (election.status !== 'active' ||
        now < new Date(election.start_date) ||
        now > new Date(election.end_date)) {
      return res.status(403).json({ message: 'Voting is not active for this election' });
    }

    if (!election.contestants.id(contestant_id)) {
      return res.status(404).json({ message: 'Contestant not found in this election' });
    }

    const existingVote = await Vote.findOne({ election_id: election._id, user_id: userId });
    if (existingVote) {
      return res.status(403).json({ message: 'User has already voted in this election' });
    }

    const voteCount = await Vote.countDocuments({ election_id: election._id });
    if (voteCount >= election.total_votes_allowed) {
      return res.status(409).json({ message: 'Vote limit reached for this election' });
    }

    const vote = new Vote({
      election_id: election._id,
      contestant_id,
      user_id: userId,
      cast_at: new Date()
    });

    await vote.save();

    // Update contestant's vote count
    const contestant = election.contestants.id(contestant_id);
    contestant.vote_count = (contestant.vote_count || 0) + 1;
    election.total_votes_cast = (election.total_votes_cast || 0) + 1;
    await election.save();

    res.status(201).json({
      vote: {
        _id: vote._id,
        election_id: vote.election_id,
        contestant_id: vote.contestant_id,
        user_id: vote.user_id,
        cast_at: moment(vote.cast_at).format('YYYY-MM-DD:hh:mm:a')
      },
      message: 'Vote cast successfully'
    });

  } catch (err) {
    console.error('Cast vote error:', err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
