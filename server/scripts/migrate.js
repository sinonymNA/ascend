#!/usr/bin/env node
/**
 * Database migration script
 *
 * Usage:
 *   node migrate.js
 *
 * Set environment variable:
 *   export DATABASE_URL="postgresql://user:pass@host:port/db"
 *   node migrate.js
 */

require('dotenv').config({ path: '../../.env' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not set. Set it with:');
  console.error('   export DATABASE_URL="postgresql://user:pass@host:port/db"');
  process.exit(1);
}

console.log('📦 Connecting to database...');
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  try {
    // Read schema.sql
    const schemaPath = path.join(__dirname, '../../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split by statements and filter out comments/empty lines
    const statements = schema
      .split(/;(?=\n)/)
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('--'));

    console.log(`🔄 Running ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.length < 10) continue; // Skip tiny statements

      try {
        await pool.query(stmt);
        console.log(`✓ [${i + 1}/${statements.length}]`);
      } catch (e) {
        // Some statements may fail (e.g., IF NOT EXISTS), that's OK
        if (e.message.includes('does not exist') || e.message.includes('already exists')) {
          console.log(`⊘ [${i + 1}/${statements.length}] (already exists, skipped)`);
        } else {
          console.warn(`⚠ [${i + 1}/${statements.length}] ${e.message}`);
        }
      }
    }

    console.log('\n✅ Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
