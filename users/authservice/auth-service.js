const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./auth-model')
const { check, matchedData, validationResult } = require('express-validator');
const app = express();
const port = 8002;
require('dotenv').config({ path: '../../.env' }); // Ruta relativa desde la carpeta authservice

app.use(express.json());

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
console.log(`mongoUri: ${mongoUri}`);
mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Conectado a MongoDB');
  })
  .catch(err => console.error('Error de conexión a MongoDB:', err.message));

function validateRequiredFields(req, requiredFields) {
    for (const field of requiredFields) {
      if (!(field in req.body)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
}

app.post('/login',  [
  check('username').isLength({ min: 3 }).trim().escape(),
  check('password').isLength({ min: 3 }).trim().escape()
],async (req, res) => {
  try {
  
  validateRequiredFields(req, ['username', 'password']);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array().toString()});
  }
    let username =req.body.username.toString();
    let password =req.body.password.toString();
    
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
      res.json({ token: token, username: username, createdAt: user.createdAt });
      
    } else {
      res.status(401).json({ error: 'The username or password is incorrect.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

const server = app.listen(port, () => {
  console.log(`Auth Service listening at http://localhost:${port}`);
});

server.on('close', () => {
    mongoose.connection.close();
  });

module.exports = server
