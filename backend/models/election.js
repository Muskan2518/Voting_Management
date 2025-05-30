const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vote_count: { type: Number, default: 0 }
});

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true, unique: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_votes_allowed: Number,
  total_votes_cast: { type: Number, default: 0 },
  start_date: Date,
  end_date: Date,
  contestants: [contestantSchema],
  status: { type: String, enum: ['active', 'ended'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
