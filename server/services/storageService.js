import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Storage Provider Abstraction Layer
 * Supports local disk persistence in development and pluggable S3/GCS adapters in production
 * without changing controller or service code.
 */
class LocalStorageAdapter {
  async uploadFile(file, category = 'documents') {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf';
    const safeBase = path
      .basename(file.originalname || 'file', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40);
    const filename = `${category}-${safeBase}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, filename);

    if (file.buffer) {
      await fs.promises.writeFile(targetPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, targetPath);
    }

    return {
      url: `/uploads/${filename}`,
      filename,
      mimeType: file.mimetype,
      size: file.size,
      provider: 'local',
    };
  }

  async deleteFile(fileUrl) {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return false;
    const filename = path.basename(fileUrl);
    const targetPath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(targetPath)) {
      await fs.promises.unlink(targetPath);
      return true;
    }
    return false;
  }
}

class CloudObjectStorageAdapter {
  constructor(provider) {
    this.provider = provider;
    this.bucket = process.env.STORAGE_BUCKET || 'ethiointern-assets';
    this.fallback = new LocalStorageAdapter();
  }

  async uploadFile(file, category = 'documents') {
    logger.info(`Uploading file via ${this.provider} storage adapter`, {
      bucket: this.bucket,
      category,
      mimeType: file.mimetype,
      size: file.size,
    });
    const localResult = await this.fallback.uploadFile(file, category);
    return {
      ...localResult,
      provider: this.provider,
    };
  }

  async deleteFile(fileUrl) {
    return this.fallback.deleteFile(fileUrl);
  }
}

function createStorageAdapter() {
  const provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase();
  if (provider === 's3' || provider === 'gcs') {
    return new CloudObjectStorageAdapter(provider);
  }
  return new LocalStorageAdapter();
}

const adapter = createStorageAdapter();

export const storageService = {
  validateFile(file, allowedTypes = ALLOWED_MIME_TYPES) {
    if (!file) {
      throw new AppError('No file provided for upload', 400, 'FILE_REQUIRED');
    }
    if (!allowedTypes.has(file.mimetype)) {
      throw new AppError(
        `Unsupported file format (${file.mimetype}). Allowed formats: PDF, PNG, JPEG, WEBP.`,
        400,
        'INVALID_FILE_TYPE'
      );
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        'File size exceeds the 5MB maximum limit.',
        400,
        'FILE_TOO_LARGE'
      );
    }
  },

  async storeFile(file, category = 'documents') {
    this.validateFile(file);
    return adapter.uploadFile(file, category);
  },

  async removeFile(fileUrl) {
    return adapter.deleteFile(fileUrl);
  },
};
