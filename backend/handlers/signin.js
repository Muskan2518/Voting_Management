const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('private_key.pem', 'utf8');

const signin = async (req, res) => {
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ name });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const expiresIn = 3600; // seconds = 1 hour

    const token = jwt.sign(
      { id: user._id, name: user.name },
      privateKey,
      { algorithm: 'RS256', expiresIn: expiresIn }
    );

    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token,
      expires_in: expiresIn
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = signin;
