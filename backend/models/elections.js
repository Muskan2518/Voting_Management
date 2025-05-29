const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const electionSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100              // Max 100 characters
  },
  description: {
    type: String,
    maxlength: 500              // Optional, max 500 characters
  },
  code: {
    type: String,
    required: true,
    unique: true,               // 6-character alphanumeric, must be indexed
    minlength: 6,
    maxlength: 6,
    match: /^[A-Za-z0-9]{6}$/,  // Enforce alphanumeric code format
    index: true
  },
  created_by: {
    type: Types.ObjectId,       // Reference to users._id
    ref: 'User',
    required: true
  },
  total_votes_allowed: {
    type: Number,
    default: null               // null means unlimited
  },
  total_votes_cast: {
    type: Number,
    default: 0                  // Default vote count
  },
  status: {
    type: String,
    enum: ['active', 'closed'], // Status options
    default: 'active'
  },
  start_date: {
    type: Date                  // Optional
  },
  end_date: {
    type: Date                  // Optional
  }
}, {
  timestamps: {                 // Automatically creates:
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = model('Election', electionSchema);
