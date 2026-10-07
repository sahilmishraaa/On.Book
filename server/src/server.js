import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ebookRoutes from './routes/ebooks.js';
import contactRoutes from './routes/contact.js';
import draftRoutes from "./routes/drafts.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(
  '/uploads/covers',
  express.static(path.resolve('uploads/covers'))
);

app.use(
  '/uploads/avatars',
  express.static(path.resolve('uploads/avatars'))
);

// Health check
app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ebooks', ebookRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/drafts", draftRoutes);

// Server
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on ${port}`);
    });
  })
  .catch((e) => {
    console.error(
      'MongoDB connection failed:',
      e.message
    );

    process.exit(1);
  });