const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./user-model');
const GameStats = require('./game-stats-model');

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type']
}));

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
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

app.post('/adduser', async (req, res) => {
    try {
        validateRequiredFields(req, ['username', 'password']);

        const checkUsernameAlreadyExists = await User.findOne({ username: req.body.username.toString() });
        if (checkUsernameAlreadyExists) {
          throw new Error('Username already exists, please choose another one');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            password: hashedPassword,
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/user/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username.toString() }, { password: 0 });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user data', details: error.message });
    }
});

app.put('/user/:username/profile', async (req, res) => {
    try {
        const username = req.params.username;
        const { profileImage } = req.body;

        if (!profileImage || typeof profileImage !== 'string' || !profileImage.startsWith('profile_') || !profileImage.endsWith('.gif')) {
            return res.status(400).json({ error: 'Invalid profile image name provided' });
        }

        const allowedImages = Array.from({ length: 8 }, (_, i) => `profile_${i + 1}.gif`);
        if (!allowedImages.includes(profileImage)) {
             return res.status(400).json({ error: 'Selected profile image is not valid' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { username: username.toString() },
            { $set: { profileImage: profileImage } },
            { new: true, projection: { password: 0 } }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile image', details: error.message });
    }
});

app.post('/api/stats', async (req, res) => {
  try {
    const { username, score, correctAnswers, incorrectAnswers, totalRounds } = req.body;
    if (username === undefined ||
      score === undefined ||
      correctAnswers === undefined ||
      incorrectAnswers === undefined ||
      totalRounds === undefined) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Faltan campos requeridos: username, score, correctAnswers, incorrectAnswers, totalRounds'
      });
    }

    const newStats = new GameStats({
      username,
      score,
      correctAnswers,
      incorrectAnswers,
      totalRounds,
      accuracy: correctAnswers == 0 ? 0 : parseFloat(((correctAnswers / totalRounds) * 100).toFixed(2))
    });

    const savedStats = await newStats.save();
    res.status(201).json(savedStats);

  } catch (error) {
    console.error('Error guardando estadísticas:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Falta el parámetro requerido: username'
      });
    }

    const stats = await GameStats.find({ username: username.toString() })
      .sort({ timestamp: -1 });

    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

app.get('/ranking', async (req, res) => {
  const stats = await GameStats.aggregate([
    {
      $group: {
        _id: '$username',
        score: { $max: '$score' }
      }
    },
    {
      $sort: { score: -1 }
    }
  ]);

  res.json(stats);
});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

server.on('close', () => {
  mongoose.connection.close();
});

module.exports = server;