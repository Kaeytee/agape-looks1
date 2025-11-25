/**
 * Database Migration Runner
 * @module database/migrator
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query, transaction } from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates migrations tracking table if not exists
 */
async function ensureMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await query(sql);
  logger.info('Migrations table ensured');
}

/**
 * Gets all executed migrations
 */
async function getExecutedMigrations() {
  const result = await query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map(row => row.version);
}

/**
 * Gets all migration files
 */
async function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = await fs.readdir(migrationsDir);
  return files.filter(f => f.endsWith('.sql')).sort();
}

/**
 * Runs pending migrations
 */
export async function runMigrationsUp() {
  try {
    await ensureMigrationsTable();
    
    const executed = await getExecutedMigrations();
    const files = await getMigrationFiles();
    const pending = files.filter(f => !executed.includes(f));
    
    if (pending.length === 0) {
      logger.info('No pending migrations');
      return;
    }
    
    logger.info(`Running ${pending.length} migrations...`);
    
    for (const file of pending) {
      await transaction(async (client) => {
        const filePath = path.join(__dirname, 'migrations', file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
          [file, file.replace('.sql', '')]
        );
        
        logger.info(`Migration executed: ${file}`);
      });
    }
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * Rollback last migration
 */
export async function runMigrationDown() {
  logger.warn('Migration rollback not implemented - manual rollback required');
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  
  if (command === 'up') {
    runMigrationsUp()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (command === 'down') {
    runMigrationDown()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    console.log('Usage: node migrator.js [up|down]');
    process.exit(1);
  }
}
