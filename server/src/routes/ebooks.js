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

// Helper functions
async function findBook(id) {
  return Ebook.findOne({
    $or: [{ _id: id }, { slug: id }],
    isDeleted: false
  })
    .populate('author', 'name username avatar bio')
    .populate('category', 'name');
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

// GET /categories
router.get('/categories', async (_, res) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET / (Filter & Search books)
router.get('/', async (req, res) => {
  try {
    const { q = '', category = '', paid = '', sort = 'latest' } = req.query;
    const filter = { isDeleted: false, status: 'available' };

    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { keywords: new RegExp(q, 'i') }
      ];
    }

    if (category) filter.category = category;
    if (paid === 'true') filter.isPaid = true;
    if (paid === 'false') filter.isPaid = false;

    let query = Ebook.find(filter)
      .populate('author', 'name username')
      .populate('category', 'name');

    if (sort === 'rating') {
      query = query.sort({ rating: -1 });
    } else if (sort === 'popular') {
      query = query.sort({ purchaseCount: -1 });
    } else {
      query = query.sort({ uploadedAt: -1, createdAt: -1 });
    }

    res.json(await query);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /bestsellers
router.get('/bestsellers', async (req, res) => {
  try {
    const bestsellers = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$ebook',
          sales: { $sum: 1 }
        }
      }, {
        $sort: { sales: -1 }
      },
      {
        $limit: 5
      }, {
        $lookup: {
          from: 'ebooks',
          localField: '_id',
          foreignField: '_id',
          as: 'book'
        }
      },
      {
        $unwind: '$book'
      },
      {
        $match: {
          'book.isDeleted': false,
          'book.status': 'available'
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$book', { purchaseCount: '$sales' }]
          }
        }
      }
    ]);

    res.json(bestsellers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /mine
router.get('/mine', auth, creatorOnly, async (req, res) => {
  try {
    const books = await Ebook.find({ author: req.user._id })
      .populate('category')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /creator/analytics
router.get('/creator/analytics', auth, creatorOnly, async (req, res) => {
  try {
    const creatorId = req.user._id;

    // Get all books belonging to this creator
    const books = await Ebook.find({
      author: creatorId,
      isDeleted: false
    }).lean();

    const bookIds = books.map((book) => book._id);

    // Get successful orders for the creator's books
    const orders = await Order.find({
      ebook: { $in: bookIds },
      status: { $in: ['paid', 'completed'] }
    }).lean();

    // Total earnings
    const totalEarnings = orders.reduce(
      (total, order) => total + Number(order.amount || 0),
      0
    );

    // Total books sold
    const totalSales = orders.length;

    // Sales + earnings for each book
    const bookStats = {};

    books.forEach((book) => {
      bookStats[String(book._id)] = { sales: 0, earnings: 0 };
    });

    orders.forEach((order) => {
      const id = String(order.ebook);

      if (bookStats[id]) {
        bookStats[id].sales += 1;
        bookStats[id].earnings += Number(order.amount || 0);
      }
    });

    // Attach analytics to books
    const topSellingBooks = books
      .map((book) => ({
        ...book,
        sales: bookStats[String(book._id)]?.sales || 0,
        earnings: bookStats[String(book._id)]?.earnings || 0
      }))
      .sort((a, b) => b.sales - a.sales);

    res.json({
      totalEarnings,
      totalSales,
      publishedBooks: books.length,
      topSellingBooks
    });
  } catch (error) {
    console.error('Creator analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /:id/access (Returns whether user can read the book)
router.get('/:id/access', auth, async (req, res) => {
  try {
    const book = await findBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const purchased = await Order.exists({
      user: req.user._id,
      ebook: book._id,
      status: { $in: ['paid', 'completed'] }
    });

    const isAuthor = String(book.author?._id) === String(req.user._id);
    const canRead = !book.isPaid || book.price <= 0 || Boolean(purchased) || isAuthor;

    res.json({
      canRead,
      isPaid: Boolean(book.isPaid && book.price > 0),
      purchased: Boolean(purchased),
      message: canRead
        ? 'Reading access granted'
        : 'Purchase this book before reading it.'
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /:id/read (Protected file stream)
router.get('/:id/read', auth, async (req, res) => {
  try {
    const book = await findBook(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!book.file) return res.status(404).json({ message: 'Reading file unavailable' });

    const isAuthor = String(book.author?._id) === String(req.user._id);
    const canRead = (await hasReadAccess(req.user._id, book)) || isAuthor;

    if (!canRead) {
      return res.status(403).json({ message: 'Purchase this book before reading it.' });
    }

    const relative = book.file.startsWith('/uploads/')
      ? book.file.replace('/uploads/', '')
      : book.file;
    const filePath = path.resolve('uploads', relative);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Reading file unavailable' });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.epub'
          ? 'application/epub+zip'
          : 'application/octet-stream';

    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    res.sendFile(filePath);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /:id (Get book details and reviews)
router.get('/:id', async (req, res) => {
  try {
    const b = await findBook(req.params.id);
    if (!b) return res.status(404).json({ message: 'Book not found' });

    const reviews = await Review.find({ ebook: b._id })
      .populate('user', 'name username avatar bio')
      .sort({ createdAt: -1 });

    res.json({ book: b, reviews });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /:id/buy (Demo purchase endpoint)
router.post('/:id/buy', auth, async (req, res) => {
  try {
    const b = await Ebook.findById(req.params.id);

    if (!b || b.isDeleted) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Free books do not require a payment
    if (!b.isPaid || Number(b.price) <= 0) {
      return res.status(400).json({ message: 'This is a free book. No payment is required.' });
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

    if (!Number.isFinite(enteredAmount)) {
      return res.status(400).json({ message: 'Please enter a valid purchase amount.' });
    }

    // Compare using cents to avoid floating-point errors
    const enteredCents = Math.round(enteredAmount * 100);
    const actualCents = Math.round(actualPrice * 100);

    if (enteredCents !== actualCents) {
      return res.status(400).json({
        message: `Incorrect amount. Please enter the exact purchase amount of $${actualPrice.toFixed(2)}.`
      });
    }

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
    res.status(500).json({ message: e.message });
  }
});

// POST /:id/reviews
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, title, text } = req.body;

    if (!rating || !title || !text) {
      return res.status(400).json({
        message: 'Rating, title and review text are required.'
      });
    }

    const review = await Review.findOneAndUpdate(
      {
        ebook: req.params.id,
        user: req.user._id
      },
      {
        user: req.user._id,
        ebook: req.params.id,
        rating,
        title,
        text
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    const stats = await Review.aggregate([
      {
        $match: {
          ebook: review.ebook
        }
      },
      {
        $group: {
          _id: null,
          avg: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    await Ebook.findByIdAndUpdate(req.params.id, {
      rating: stats[0]?.avg || 0,
      reviewCount: stats[0]?.count || 0
    });

    res.json(review);

  } catch (e) {
    console.error('Review submission error:', e);

    res.status(500).json({
      message: e.message
    });
  }
});

// POST /publish (Upload and publish an ebook)
router.post(
  '/publish',
  auth,
  creatorOnly,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        pages,
        price,
        pricingType,
        keywords,
        alias,
        publisher,
        category
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required' });
      }

      const cover = req.files?.coverImage?.[0];
      const file = req.files?.bookFile?.[0];

      const base = slugify(title, { lower: true, strict: true });
      let slug = base;
      let i = 1;
      while (await Ebook.findOne({ slug })) {
        slug = `${base}-${i++}`;
      }

      const book = await Ebook.create({
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

      res.status(201).json(book);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

// PATCH /:id (Update ebook details)
router.patch('/:id', auth, creatorOnly, async (req, res) => {
  try {
    const book = await Ebook.findOne({ _id: req.params.id, author: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    Object.assign(book, req.body);
    await book.save();

    res.json(book);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE /:id (Soft delete ebook)
router.delete('/:id', auth, creatorOnly, async (req, res) => {
  try {
    const book = await Ebook.findOne({ _id: req.params.id, author: req.user._id });
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.isDeleted = true;
    book.status = 'unavailable';
    book.deletedAt = new Date();
    await book.save();

    res.json({ message: 'Book removed' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /:id/reviews/:reviewId/helpful (Vote review helpfulness)
router.post('/:id/reviews/:reviewId/helpful', auth, async (req, res) => {
  try {
    const field = req.body.type === 'notHelpful' ? 'notHelpful' : 'helpful';
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { [field]: 1 } },
      { new: true }
    );

    res.json(review);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;