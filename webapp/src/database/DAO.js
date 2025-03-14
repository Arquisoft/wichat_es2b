const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/usersDB');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

connectDB();

const gameSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  correctAnswers: Number,
  incorrectAnswers: Number,
  responseTimes: [Number]
});

const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  user_id: { type: String, default: () => uuidv4() },
  username: { type: String, unique: true, required: true },
  realName: String,
  lastName: String,
  password: String,
  games: [gameSchema]
});

const User = mongoose.model('User', userSchema);

class UserService {
  static async createUser(userData) {
    try {
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        throw new Error('Username already exists');
      }
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  static async getUsers() {
    try {
      return await User.find();
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(id, newData) {
    try {
      return await User.findByIdAndUpdate(id, newData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  static async registerGame(userId, correctAnswers, incorrectAnswers, responseTimes) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      
      user.games.push({
        correctAnswers,
        incorrectAnswers,
        responseTimes
      });
      
      return await user.save();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;