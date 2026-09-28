import express from 'express';
import bcrypt from 'bcryptjs';
import { auth } from '../middleware/auth.js';

import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import ReadingHistory from '../models/ReadingHistory.js';

const router = express.Router();

router.put('/profile', auth, async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (
      !password ||
      !(await bcrypt.compare(password, req.user.password))
    ) {
      return res.status(400).json({
        message: 'Incorrect password',
      });
    }

    req.user.name = (fullName || '').trim();
    req.user.email = (email || '').toLowerCase().trim();

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        name: req.user.name,
        email: req.user.email,
        username: req.user.username,
        role: req.user.role,
      },
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

router.get('/orders', auth, async (req, res) => {
  res.json(
    await Order.find({
      user: req.user._id,
    })
      .populate('ebook')
      .sort({
        createdAt: -1,
      })
  );
});

router.get('/wishlist', auth, async (req, res) => {
  const w = await Wishlist.findOne({
    user: req.user._id,
  }).populate('ebooks');

  res.json(w?.ebooks || []);
});

router.post('/wishlist/:ebookId', auth, async (req, res) => {
  let w = await Wishlist.findOne({
    user: req.user._id,
  });

  if (!w) {
    w = await Wishlist.create({
      user: req.user._id,
      ebooks: [],
    });
  }

  const id = req.params.ebookId;

  const exists = w.ebooks.some(
    (x) => x.toString() === id
  );

  w.ebooks = exists
    ? w.ebooks.filter(
        (x) => x.toString() !== id
      )
    : [...w.ebooks, id];

  await w.save();

  res.json({
    saved: !exists,
  });
});

router.get('/history', auth, async (req, res) => {
  res.json(
    await ReadingHistory.find({
      user: req.user._id,
    })
      .populate('ebook')
      .sort({
        lastReadAt: -1,
      })
  );
});

router.post('/history/:ebookId', auth, async (req, res) => {
  await ReadingHistory.findOneAndUpdate(
    {
      user: req.user._id,
      ebook: req.params.ebookId,
    },
    {
      lastReadAt: new Date(),
    },
    {
      upsert: true,
    }
  );

  res.json({
    ok: true,
  });
});

router.post('/become-creator', auth, async (req, res) => {
  try {
    if (req.user.role === 'creator') {
      return res.status(400).json({
        message: 'You are already a creator',
      });
    }

    if (req.user.role === 'admin') {
      return res.status(400).json({
        message: 'Admin users already have creator access',
      });
    }

    req.user.role = 'creator';

    await req.user.save();

    res.json({
      message: 'You are now a creator!',
      user: {
        id: req.user._id,
        name: req.user.name,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
});

export default router;