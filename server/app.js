import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Security HTTP headers (relaxed CSP for Vite preview iframe & Google Fonts)
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL || true,
      credentials: true,
    })
  );

  // Rate limiting on API routes
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    },
  });

  app.use('/api', apiLimiter);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files safely
  app.use('/uploads', express.static(path.resolve(__dirname, './uploads')));

  // Mount REST API
  app.use('/api', apiRoutes);

  // Handle unknown /api routes cleanly
  app.use('/api/*', notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
