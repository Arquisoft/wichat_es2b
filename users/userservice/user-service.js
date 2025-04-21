const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const User = require('./user-model');
const GameStats = require('./game-stats-model');
require('dotenv').config({ path: '../../.env' }); // Ruta relativa desde la carpeta userservice

const app = express();
const port = process.env.PORT || 8001;

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

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

// Ruta para crear un usuario (se guarda en la colección 'users')
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
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message }); 
    }
});

// Ruta para guardar estadísticas (se guarda en la colección 'stats')
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

// Ruta para obtener estadísticas (se obtienen de la colección 'stats')
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

// Ruta para obtener todo el ranking
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
