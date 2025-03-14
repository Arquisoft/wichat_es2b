const express = require('express');
const UserService = require('../DAO');
const router = express.Router();

router.post('/check-username', async (req, res) => {
  const { username } = req.body;
  
  try {
    const user = await UserService.getUserByUsername(username);
    
    if (user) {
      return res.json({ exists: true });
    }
    return res.json({ exists: false });
  } catch (error) {
    console.error('Error checking username:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/adduser', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const newUser = await UserService.createUser({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/register-game', async (req, res) => {
  const { userId, correctAnswers, incorrectAnswers, responseTimes } = req.body;
  
  try {
    await UserService.registerGame(userId, correctAnswers, incorrectAnswers, responseTimes);
    res.status(200).json({ message: 'Game statistics registered successfully' });
  } catch (error) {
    console.error('Error registering game stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;