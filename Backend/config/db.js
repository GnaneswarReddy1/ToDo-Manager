// backend/config/db.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://gnane187_db_user:L8zUnA87rW3JCkl3@cluster187.toai9bf.mongodb.net/smarttodo?retryWrites=true&w=majority&appName=Cluster187';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Stop server if DB fails
  }
};

module.exports = connectDB;
