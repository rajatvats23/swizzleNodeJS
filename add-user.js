// save this as add-user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User Schema (simplified version of your user model)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createUser() {
  try {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    
    // Create user
    const user = new User({
      name: 'Rajat Sharmaa',
      email: 'rajatvats2315+1@gmail.com', // Replace with your email
      password: hashedPassword,
      role: 'admin'
    });
    
    // Save user
    await user.save();
    console.log('User created successfully:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

createUser();