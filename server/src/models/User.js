import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },

  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 15,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['reader', 'creator', 'admin'],
    default: 'reader',
  },

  // New
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },

  // New
  avatar: {
    type: String,
    default: '',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('User', userSchema);