import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadImage } from '../utils/cloudinary.js';

const uploadDir = 'uploads/';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProductImage = async (req, res, next) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const result = await uploadImage(file.path);
          fs.unlink(file.path, () => {});
          return result;
        } catch (err) {
          fs.unlink(file.path, () => {});
          throw err;
        }
      })
    );

    res.status(201).json({ images: results });
  } catch (error) {
    next(error);
  }
};
