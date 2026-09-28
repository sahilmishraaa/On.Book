import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook', required: true },
  title: String,
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'paid', 'completed'], default: 'completed' },
  purchasedAt: { type: Date, default: Date.now }
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
