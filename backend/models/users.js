const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,   // Optional: Let MongoDB auto-generate if not manually set
    auto: true
  },
  email: {
    type: String,                  // Unique, required, lowercase
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,                  // Hashed password (e.g., bcrypt)
    required: true
  },
  name: { 
    type: String,  sparse: true } // <-- fixes the issue

}, {
  timestamps: {                    // Automatically adds:
    createdAt: 'created_at',       //   "created_at": ISODate
    updatedAt: 'updated_at'        //   "updated_at": ISODate
  }
});

module.exports = model('users', userSchema);
