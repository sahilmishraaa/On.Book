import express from 'express';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';
import Ebook from '../models/Ebook.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import { auth, creatorOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

async function findBook(id) {
  return Ebook.findOne({
    $or: [{ _id: id }, { slug: id }],
    isDeleted: false
  }).populate('author', 'name username').populate('category', 'name');
}

async function hasReadAccess(userId, book) {
  if (!book.isPaid || book.price <= 0) return true;
  const order = await Order.findOne({
    user: userId,
    ebook: book._id,
    status: { $in: ['paid', 'completed'] }
  });
  return Boolean(order);
}

router.get('/categories', async (_, res) => res.json(await Category.find().sort('name')));

router.get('/', async (req, res) => {
  try {
    const { q = '', category = '', paid = '', sort = 'latest' } = req.query;
    const filter = { isDeleted: false, status: 'available' };
    if (q) filter.$or = [
      { title: new RegExp(q, 'i') },
      { description: new RegExp(q, 'i') },
      { keywords: new RegExp(q, 'i') }
    ];
    if (category) filter.category = category;
    if (paid === 'true') filter.isPaid = true;
    if (paid === 'false') filter.isPaid = false;

    let query = Ebook.find(filter).populate('author', 'name username').populate('category', 'name');
    if (sort === 'rating') query = query.sort({ rating: -1 });
    else if (sort === 'popular') query = query.sort({ purchaseCount: -1 });
    else query = query.sort({ uploadedAt: -1, createdAt: -1 });
    res.json(await query);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/mine', auth, creatorOnly, async (req, res) => {
  res.json(await Ebook.find({ author: req.user._id }).populate('category').sort({ createdAt: -1 }));
});

// Returns whether the current user is allowed to read this book.
router.get('/:id/access', auth, async (req, res) => {
  try {
    const book = await findBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const purchased = await Order.exists({
      user: req.user._id,
      ebook: book._id,
      status: { $in: ['paid', 'completed'] }
    });
    const canRead = !book.isPaid || book.price <= 0 || Boolean(purchased) || String(book.author?._id) === String(req.user._id);
    res.json({
      canRead,
      isPaid: Boolean(book.isPaid && book.price > 0),
      purchased: Boolean(purchased),
      message: canRead ? 'Reading access granted' : 'Purchase this book before reading it.'
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Protected ebook delivery. Paid books can only be streamed after purchase.
router.get('/:id/read', auth, async (req, res) => {
  try {
    const book = await findBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!book.file) return res.status(404).json({ message: 'Reading file unavailable' });

    const canRead = await hasReadAccess(req.user._id, book) || String(book.author?._id) === String(req.user._id);
    if (!canRead) {
      return res.status(403).json({ message: 'Purchase this book before reading it.' });
    }

    const relative = book.file.startsWith('/uploads/') ? book.file.replace('/uploads/', '') : book.file;
    const filePath = path.resolve('uploads', relative);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Reading file unavailable' });

    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.pdf' ? 'application/pdf' : ext === '.epub' ? 'application/epub+zip' : 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    res.sendFile(filePath);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  const b = await findBook(req.params.id);
  if (!b) return res.status(404).json({ message: 'Book not found' });
  const reviews = await Review.find({ ebook: b._id }).populate('user', 'name username').sort({ createdAt: -1 });
  res.json({ book: b, reviews });
});

// Demo purchase: no real payment gateway is used. The purchase is completed immediately.
router.post('/:id/buy', auth, async (req, res) => {
  try {
    const b = await Ebook.findById(req.params.id);

    if (!b || b.isDeleted) {
      return res.status(404).json({
        message: 'Book not found'
      });
    }

    // Free books do not require a payment.
    // They can be read directly and do not need a purchase.
    if (!b.isPaid || Number(b.price) <= 0) {
      return res.status(400).json({
        message: 'This is a free book. No payment is required.'
      });
    }

    const existing = await Order.findOne({
      user: req.user._id,
      ebook: b._id,
      status: { $in: ['paid', 'completed'] }
    });

    if (existing) {
      return res.json({
        message: 'You already own this book',
        order: existing
      });
    }

    const enteredAmount = Number(req.body.amount);
    const actualPrice = Number(b.price);

    // Validate the amount.
    if (!Number.isFinite(enteredAmount)) {
      return res.status(400).json({
        message: 'Please enter a valid purchase amount.'
      });
    }

    // Compare using cents to avoid floating-point problems.
    const enteredCents = Math.round(enteredAmount * 100);
    const actualCents = Math.round(actualPrice * 100);

    if (enteredCents !== actualCents) {
      return res.status(400).json({
        message: `Incorrect amount. Please enter the exact purchase amount of $${actualPrice.toFixed(2)}.`
      });
    }

    // Demo payment succeeds because the amount is correct.
    const order = await Order.create({
      user: req.user._id,
      ebook: b._id,
      title: b.title,
      amount: actualPrice,
      status: 'completed',
      purchasedAt: new Date()
    });

    b.purchaseCount += 1;
    await b.save();

    res.status(201).json({
      message: 'Demo payment successful. The book is now in My Books.',
      order,
      demoPayment: true
    });

  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
});

router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, title, text } = req.body;
    const review = await Review.findOneAndUpdate(
      { ebook: req.params.id, user: req.user._id },
      { rating, title, text },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const stats = await Review.aggregate([
      { $match: { ebook: review.ebook } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    await Ebook.findByIdAndUpdate(req.params.id, {
      rating: stats[0]?.avg || 0,
      reviewCount: stats[0]?.count || 0
    });
    res.json(review);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/publish', auth, creatorOnly, upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'bookFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, pages, price, pricingType, genres = '', keywords, alias, publisher, category } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    const cover = req.files?.coverImage?.[0];
    const file = req.files?.bookFile?.[0];
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let i = 1;
    while (await Ebook.findOne({ slug })) slug = `${base}-${i++}`;

    const b = await Ebook.create({
      title,
      slug,
      description,
      pageCount: Number(pages) || null,
      coverImage: cover ? `/uploads/covers/${cover.filename}` : '',
      file: file ? `/uploads/books/${file.filename}` : '',
      fileSize: file?.size || null,
      isPaid: pricingType !== 'free',
      price: pricingType === 'free' ? 0 : Number(price) || 0,
      keywords,
      publisher: publisher || alias || req.user.name,
      author: req.user._id,
      category: category || null
    });
    res.status(201).json(b);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch('/:id', auth, creatorOnly, async (req, res) => {
  const b = await Ebook.findOne({ _id: req.params.id, author: req.user._id });
  if (!b) return res.status(404).json({ message: 'Book not found' });
  Object.assign(b, req.body);
  await b.save();
  res.json(b);
});

router.delete('/:id', auth, creatorOnly, async (req, res) => {
  const b = await Ebook.findOne({ _id: req.params.id, author: req.user._id });
  if (!b) return res.status(404).json({ message: 'Book not found' });
  b.isDeleted = true;
  b.status = 'unavailable';
  b.deletedAt = new Date();
  await b.save();
  res.json({ message: 'Book removed' });
});

router.post('/:id/reviews/:reviewId/helpful', auth, async (req, res) => {
  const field = req.body.type === 'notHelpful' ? 'notHelpful' : 'helpful';
  const r = await Review.findByIdAndUpdate(req.params.reviewId, { $inc: { [field]: 1 } }, { new: true });
  res.json(r);
});

export default router;
