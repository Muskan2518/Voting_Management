const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const contestantSchema = new Schema({
  election_id: {
    type: Types.ObjectId,
    ref: 'Election',               // Reference to elections._id
    required: true,
    index: true                    // Indexed for faster lookups per election
  },
  name: {
    type: String,
    required: true,
    maxlength: 50                 // Max 50 characters
  },
  vote_count: {
    type: Number,
    default: 0                   // Tracks number of votes
  }
}, {
  timestamps: {
    createdAt: 'created_at',      // Only store created_at, no updated_at needed
    updatedAt: false
  }
});

module.exports = model('Contestant', contestantSchema);
