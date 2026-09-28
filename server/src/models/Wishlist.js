import mongoose from 'mongoose';
const wishlistSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, ebooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ebook' }] });
export default mongoose.model('Wishlist', wishlistSchema);
