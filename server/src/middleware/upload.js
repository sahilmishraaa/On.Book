import multer from 'multer';
import fs from 'fs';
import path from 'path';

const booksDir = path.resolve('uploads/books');
const coversDir = path.resolve('uploads/covers');
fs.mkdirSync(booksDir, { recursive: true });
fs.mkdirSync(coversDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, file.fieldname === 'coverImage' ? coversDir : booksDir);
  },
  filename: (_, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.fieldname === 'coverImage') return cb(null, true);
    const allowed = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
    if (allowed.includes(file.mimetype) || /\.(pdf|epub|mobi)$/i.test(file.originalname)) return cb(null, true);
    cb(new Error('Only PDF, EPUB, or MOBI ebook files are allowed.'));
  }
});
