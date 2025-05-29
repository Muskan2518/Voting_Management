const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const voteSchema = new Schema({
  election_id: {
    type: Types.ObjectId,
    ref: 'Election',
    required: true,
    index: true                    // Indexed for faster election-based queries
  },
  contestant_id: {
    type: Types.ObjectId,
    ref: 'Contestant',
    required: true
  },
  user_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true                    // Indexed to prevent multiple votes by same user
  },
  cast_at: {
    type: Date,
    default: Date.now              // Automatically sets current timestamp
  }
});

module.exports = model('Vote', voteSchema);
