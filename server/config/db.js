import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { generateInitialSeedData } from '../database/seeds/seedData.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../database/store.json');

/**
 * Relational Database Engine & PostgreSQL Adapter
 * - Connects to PostgreSQL via DATA_URL (or DATABASE_URL) from .env using pg.Pool.
 * - Supports parameterized queries, transactions, and connection testing.
 * - Provides seamless fallback to persistent relational store (server/database/store.json)
 *   if no PostgreSQL URL is configured or while testing credentials.
 */
class RelationalDatabase {
  constructor() {
    this.tables = null;
    this.inTransaction = false;
    this.snapshot = null;
    this.pool = null;
    this.isPostgresConnected = false;
    this.connectionError = null;
    this.configuredUrl = null;
  }

  getPostgresUrl() {
    const rawUrl = process.env.DATA_URL || process.env.DATABASE_URL || '';
    return rawUrl.trim();
  }

  getSanitizedUrl() {
    const url = this.getPostgresUrl();
    if (!url) return '';
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '******';
      }
      return parsed.toString();
    } catch {
      return 'postgresql://[masked-credentials]@host/database';
    }
  }

  initPostgres() {
    const url = this.getPostgresUrl();
    if (!url) {
      this.pool = null;
      this.isPostgresConnected = false;
      return null;
    }

    if (this.pool && this.configuredUrl === url) {
      return this.pool;
    }

    this.configuredUrl = url;
    const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

    this.pool = new Pool({
      connectionString: url,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    this.pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
      this.isPostgresConnected = false;
      this.connectionError = err.message;
    });

    return this.pool;
  }

  async testConnection() {
    const url = this.getPostgresUrl();
    if (!url) {
      return {
        connected: false,
        type: 'local_relational_store',
        message: 'DATA_URL is currently empty in .env. Using built-in persistent store. Paste your PostgreSQL URL in .env (DATA_URL="...") to connect and test.',
        data_url_configured: false,
      };
    }

    try {
      const pool = this.initPostgres();
      const startTime = Date.now();
      const res = await pool.query('SELECT NOW() as current_time, version() as version');
      const latency = Date.now() - startTime;
      this.isPostgresConnected = true;
      this.connectionError = null;
      return {
        connected: true,
        type: 'PostgreSQL',
        url: this.getSanitizedUrl(),
        latency: `${latency}ms`,
        serverTime: res.rows[0]?.current_time,
        version: res.rows[0]?.version?.split(' on ')[0] || 'PostgreSQL',
        message: 'Successfully connected to PostgreSQL database!',
      };
    } catch (err) {
      this.isPostgresConnected = false;
      this.connectionError = err.message;
      return {
        connected: false,
        type: 'PostgreSQL',
        url: this.getSanitizedUrl(),
        error: err.message,
        message: `Failed to connect to PostgreSQL: ${err.message}. Please check connection URL, credentials, and network access.`,
      };
    }
  }

  init() {
    const url = this.getPostgresUrl();
    if (url) {
      this.initPostgres();
    }

    if (this.tables) return;
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.tables = JSON.parse(raw);
        return;
      }
    } catch (err) {
      logger.warn('Could not read existing store.json, initializing fresh seed data', { error: err.message });
    }
    this.resetToSeed();
  }

  resetToSeed() {
    this.tables = generateInitialSeedData();
    this.persist();
  }

  persist() {
    if (this.inTransaction) return;
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.tables, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Failed to persist relational database store', { error: err.message });
    }
  }

  uuid() {
    return crypto.randomUUID();
  }

  table(tableName) {
    this.init();
    if (!this.tables[tableName]) {
      this.tables[tableName] = [];
    }
    return this.tables[tableName];
  }

  async withTransaction(callback) {
    // Repositories currently persist to the local JSON store, so a PostgreSQL
    // connection here is unused and can cause registration to time out.
    this.init();
    this.snapshot = JSON.parse(JSON.stringify(this.tables));
    this.inTransaction = true;
    try {
      const result = await callback(this);
      this.inTransaction = false;
      this.snapshot = null;
      this.persist();
      return result;
    } catch (err) {
      if (this.snapshot) {
        this.tables = this.snapshot;
      }
      this.inTransaction = false;
      this.snapshot = null;
      throw err;
    }
  }

  /**
   * Parameterized query interface for compatibility with pg pool.query(text, params)
   */
  async query(sqlText, params = []) {
    const url = this.getPostgresUrl();
    if (url) {
      const pool = this.initPostgres();
      try {
        return await pool.query(sqlText, params);
      } catch (err) {
        logger.error('PostgreSQL query execution failed', { error: err.message, sqlText });
        throw err;
      }
    }

    this.init();
    const normalized = sqlText.trim().toUpperCase();
    if (normalized === 'SELECT 1' || normalized === 'SELECT NOW()') {
      return { rows: [{ ok: 1, now: new Date().toISOString() }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0, sqlText, params };
  }
}

export const db = new RelationalDatabase();
export default db;
