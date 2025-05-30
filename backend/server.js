const express = require('express');
const dotenv = require('dotenv');
const fs = require('fs');
const { generateKeyPairSync } = require('crypto');
const connectDB = require('./database/connect');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Generate a 2048-bit RSA key pair if not already generated
if (!fs.existsSync('private_key.pem') || !fs.existsSync('public_key.pem')) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  fs.writeFileSync('private_key.pem', privateKey);
  fs.writeFileSync('public_key.pem', publicKey);

  console.log('✅ RSA Key pair generated: private_key.pem and public_key.pem');
}

// Middleware
app.use(express.json());

// Simple route to test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend and DB connected successfully' });
});
const signup = require('./handlers/signup');  // Import the signin function
app.post('/signup', signup); 
const signinRouter = require('./handlers/signin');
app.post('/signin', signinRouter);
const createElectionRouter = require('./handlers/createElection');
app.use('/', createElectionRouter);
const getElection=require('./handlers/getElection');
app.use('/',getElection);
const getAllElectionsRoute = require('./handlers/getAllElections');
app.use('/', getAllElectionsRoute);
const castVote=require('./handlers/castVote');
app.use('/',castVote)
const voteHistory=require('./handlers/voteHistory');
app.use('/',voteHistory)




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
