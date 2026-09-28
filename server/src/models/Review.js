import mongoose from 'mongoose';
const reviewSchema = new mongoose.Schema({
  ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  helpful: { type: Number, default: 0 },
  notHelpful: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
reviewSchema.index({ ebook: 1, user: 1 }, { unique: true });
export default mongoose.model('Review', reviewSchema);
