import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './app.js';
import { db } from './config/db.js';
import { logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function startServer() {
  db.init();
  const databaseStatus = await db.testConnection();
  if (databaseStatus.connected) {
    logger.info('PostgreSQL database connection established', {
      latency: databaseStatus.latency,
      version: databaseStatus.version,
    });
  } else if (!databaseStatus.data_url_configured) {
    logger.warn('PostgreSQL database URL is not configured; using the local relational store');
  } else {
    logger.error('PostgreSQL database connection failed; using the local relational store', {
      error: databaseStatus.error,
    });
  }

  const app = createApp();

  // AI Studio environment: Nginx runs on 8080 and reverse-proxies to 3000.
  // The Node Express dev server must ALWAYS listen on port 3000.
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.join(ROOT_DIR, 'dist'));

  if (!isProd) {
    const vite = await createViteServer({
      root: ROOT_DIR,
      server: {
        middlewareMode: true,
        hmr: false, // Prevents port 24678 websocket conflict
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`EthioIntern server listening on http://0.0.0.0:${PORT}`, {
      mode: isProd ? 'production' : 'development',
      port: PORT,
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${PORT} is already in use. The EthioIntern service is already active on http://0.0.0.0:${PORT}.`);
      process.exit(0);
    } else {
      logger.error('Server error encountered', { error: err.message });
      process.exit(1);
    }
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
