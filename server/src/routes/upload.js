import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authRequired, adminRequired } from '../middleware/auth.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

// POST /api/upload - admin uploads a product image, gets back a URL to store on the product document.
uploadRouter.post('/', authRequired, adminRequired, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file received' });
  res.json({ url: `/uploads/${req.file.filename}` });
});
