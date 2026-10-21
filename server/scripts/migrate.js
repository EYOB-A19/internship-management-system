import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.resolve(__dirname, '../database/migrations');

async function migrate() {
  console.log('\n======================================================');
  console.log('   EthioIntern PostgreSQL Database Migration Runner   ');
  console.log('======================================================\n');

  const rawUrl = process.env.DATA_URL || process.env.DATABASE_URL || '';
  if (!rawUrl.trim()) {
    console.log('❌ DATA_URL is not set in .env. Skipping PostgreSQL migrations.');
    console.log('Paste your PostgreSQL URL in .env to run migrations against a live database.\n');
    process.exit(0);
  }

  const connTest = await db.testConnection();
  if (!connTest.connected) {
    console.error(`❌ Cannot migrate: database connection failed (${connTest.error})`);
    process.exit(1);
  }

  console.log(`Connected to: ${db.getSanitizedUrl()}`);
  try {
    const migrations = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const migration of migrations) {
      console.log(`Applying migration: ${migration}`);
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, migration), 'utf-8');
      await db.query(sql);
    }

    console.log('✅ All database migrations completed successfully.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrate().catch((err) => {
  logger.error('Unexpected error during migration', { error: err.message });
  process.exit(1);
});
