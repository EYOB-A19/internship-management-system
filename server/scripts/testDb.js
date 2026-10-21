import dotenv from 'dotenv';
dotenv.config();

import { db } from '../config/db.js';
import { logger } from '../utils/logger.js';

async function main() {
  console.log('\n======================================================');
  console.log('   EthioIntern PostgreSQL Database Connection Tester  ');
  console.log('======================================================\n');

  const rawUrl = process.env.DATA_URL || process.env.DATABASE_URL || '';
  if (!rawUrl.trim()) {
    console.log('❌ DATA_URL is not set or empty in .env\n');
    console.log('To connect to PostgreSQL:');
    console.log('1. Open .env in your root directory');
    console.log('2. Set DATA_URL="postgresql://user:password@host:port/dbname?sslmode=require"');
    console.log('3. Run "npm run db:test" again\n');
    console.log('Note: The application currently falls back to the local relational database store (server/database/store.json).\n');
    process.exit(0);
  }

  console.log(`Connecting to: ${db.getSanitizedUrl()}`);
  console.log('Testing connection with query: "SELECT NOW(), version()"...');

  const result = await db.testConnection();

  if (result.connected) {
    console.log('\n✅ SUCCESS: Connected to PostgreSQL database!');
    console.log(`   Latency:     ${result.latency}`);
    console.log(`   Server Time: ${result.serverTime}`);
    console.log(`   Engine:      ${result.version}\n`);

    // Check existing tables
    try {
      const tableCheck = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      console.log(`📊 Found ${tableCheck.rows.length} existing tables in database:`);
      if (tableCheck.rows.length > 0) {
        console.log(`   ${tableCheck.rows.map(r => r.table_name).join(', ')}`);
      } else {
        console.log('   (No public tables found yet. You can run migrations using "npm run db:migrate")');
      }
    } catch (e) {
      console.log(`   Could not query information_schema: ${e.message}`);
    }

    console.log('\n======================================================\n');
    process.exit(0);
  } else {
    console.log('\n❌ CONNECTION FAILED:');
    console.log(`   Error: ${result.error}`);
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure your PostgreSQL server is active and accessible over the internet.');
    console.log('2. If using Supabase, Neon, or Neon/AWS RDS, verify that SSL is enabled or sslmode=require.');
    console.log('3. Verify username and password are URL-encoded if they contain special characters (@, #, :, etc.).');
    console.log('4. Ensure your IP or 0.0.0.0/0 is permitted in PostgreSQL access control lists.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  logger.error('Unexpected error during db test', { error: err.message });
  process.exit(1);
});
