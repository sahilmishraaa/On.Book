import mongoose from 'mongoose';

const ebookSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    index: true
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  description: {
    type: String,
    required: true
  },

  coverImage: {
    type: String,
    default: ''
  },

  file: {
    type: String,
    default: ''
  },

  // Content written directly by the creator
  content: {
    type: String,
    default: ''
  },

  price: {
    type: Number,
    default: 0,
    min: 0
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  publicationDate: {
    type: Date,
    default: Date.now
  },

  purchaseCount: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0
  },

  reviewCount: {
    type: Number,
    default: 0
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },

  publisher: {
    type: String,
    default: ''
  },

  genres: {
    type: [String],
    default: [],
  },

  keywords: {
    type: String,
    default: ''
  },

  fileSize: {
    type: Number,
    default: null
  },

  pageCount: {
    type: Number,
    default: null
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

export default mongoose.model('Ebook', ebookSchema);