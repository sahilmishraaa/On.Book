import mongoose from 'mongoose';
const historySchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, ebook: { type: mongoose.Schema.Types.ObjectId, ref: 'Ebook', required: true }, lastReadAt: { type: Date, default: Date.now } }, { timestamps: true });
historySchema.index({ user: 1, ebook: 1 }, { unique: true });
export default mongoose.model('ReadingHistory', historySchema);
