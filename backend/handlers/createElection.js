const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const Election = require('../models/election');

const router = express.Router();
const privateKey = fs.readFileSync('private_key.pem', 'utf8');

function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

router.post('/create-new-election', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, privateKey, { algorithms: ['RS256'] });

    const { title, description, contestants, total_votes_allowed, start_date: rawStartDate, end_date: rawEndDate } = req.body;

    // Validate title
    if (!title || title.length > 100) {
      return res.status(400).json({ message: 'Invalid or missing title' });
    }

    // Validate contestants
    if (!Array.isArray(contestants) || contestants.length < 2 || contestants.length > 20) {
      return res.status(400).json({ message: 'Contestants must be between 2 and 20' });
    }

    for (const c of contestants) {
      if (!c.name || c.name.length > 50) {
        return res.status(400).json({ message: 'Each contestant must have a valid name (max 50 characters)' });
      }
    }

    // Parse start_date and end_date from custom format 'YYYY-MM-DD:hh:mm:a'
    const start_date = rawStartDate
      ? moment(rawStartDate, 'YYYY-MM-DD:hh:mm:a', true).toDate()
      : null;

    const end_date = rawEndDate
      ? moment(rawEndDate, 'YYYY-MM-DD:hh:mm:a', true).toDate()
      : null;

    // Validate date parsing
    if ((rawStartDate && !moment(rawStartDate, 'YYYY-MM-DD:hh:mm:a', true).isValid()) ||
        (rawEndDate && !moment(rawEndDate, 'YYYY-MM-DD:hh:mm:a', true).isValid())) {
      return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD:hh:mm:am/pm' });
    }

    const code = generateCode();

    const election = new Election({
      title,
      description,
      code,
      created_by: decoded.id,
      total_votes_allowed: total_votes_allowed || null,
      start_date,
      end_date,
      contestants: contestants.map(c => ({ name: c.name, vote_count: 0 })),
      status: 'active'
    });

    await election.save();

    res.status(201).json({
  election: {
    _id: election._id,
    title: election.title,
    description: election.description,
    code: election.code,
    created_by: election.created_by,
    created_at: moment(election.createdAt).format('YYYY-MM-DD:hh:mm:a'),
    updated_at: moment(election.updatedAt).format('YYYY-MM-DD:hh:mm:a'),
    total_votes_allowed: election.total_votes_allowed,
    total_votes_cast: 0,
    status: election.status,
    start_date: election.start_date ? moment(election.start_date).format('YYYY-MM-DD:hh:mm:a') : null,
    end_date: election.end_date ? moment(election.end_date).format('YYYY-MM-DD:hh:mm:a') : null,
    contestants: election.contestants
  },
      message: 'Election created successfully'
    });
  } catch (err) {
    console.error('Election creation error:', err);

    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
