import multer from 'multer';
import fs from 'fs';
import path from 'path';

const booksDir = path.resolve('uploads/books');
const coversDir = path.resolve('uploads/covers');
const avatarsDir = path.resolve('uploads/avatars');

fs.mkdirSync(booksDir, { recursive: true });
fs.mkdirSync(coversDir, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'coverImage') {
      return cb(null, coversDir);
    }

    if (file.fieldname === 'avatar') {
      return cb(null, avatarsDir);
    }

    cb(null, booksDir);
  },

  filename: (_, file, cb) => {
    const safe = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      '_'
    );

    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (_, file, cb) => {

    // Profile picture
    if (file.fieldname === 'avatar') {
      const allowedImages = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];

      if (
        allowedImages.includes(file.mimetype) ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(
          file.originalname
        )
      ) {
        return cb(null, true);
      }

      return cb(
        new Error(
          'Only JPG, PNG, WEBP, or GIF images are allowed.'
        )
      );
    }

    // Book cover
    if (file.fieldname === 'coverImage') {
      return cb(null, true);
    }

    // Ebook
    const allowed = [
      'application/pdf',
      'application/epub+zip',
      'application/x-mobipocket-ebook',
    ];

    if (
      allowed.includes(file.mimetype) ||
      /\.(pdf|epub|mobi)$/i.test(file.originalname)
    ) {
      return cb(null, true);
    }

    cb(
      new Error(
        'Only PDF, EPUB, or MOBI ebook files are allowed.'
      )
    );
  },
});