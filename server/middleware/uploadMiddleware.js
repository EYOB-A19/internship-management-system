import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const ALLOWED_MIMES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(
        new AppError(
          'Invalid file type. Only PDF, PNG, JPG, and WEBP files are permitted.',
          400,
          'INVALID_FILE_MIME'
        )
      );
    }
    return cb(null, true);
  },
});
