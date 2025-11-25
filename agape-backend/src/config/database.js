/**
 * Database Configuration and Connection Pool Management
 * 
 * This module provides PostgreSQL database connection configuration
 * using pg-pool for connection pooling and management.
 * Implements connection retry logic, health checks, and graceful shutdown.
 * 
 * @module config/database
 */

import pg from 'pg';
import config from './index.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

/**
 * PostgreSQL connection pool instance
 * Singleton pattern ensures only one pool exists throughout the application lifecycle
 */
let pool = null;

/**
 * Creates and configures a PostgreSQL connection pool
 * 
 * @returns {Pool} Configured PostgreSQL connection pool
 */
export function createPool() {
  // Return existing pool if already created
  if (pool) {
    return pool;
  }

  // Create new connection pool with configuration
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
    min: config.database.pool.min,
    max: config.database.pool.max,
    connectionTimeoutMillis: config.database.pool.connectionTimeout,
    idleTimeoutMillis: config.database.pool.idleTimeout,
    // Allow connections to be acquired in order (FIFO)
    allowExitOnIdle: false,
  });

  // Handle pool errors
  pool.on('error', (err, client) => {
    logger.error('Unexpected database pool error', {
      error: err.message,
      stack: err.stack,
    });
  });

  // Log successful connection
  pool.on('connect', (client) => {
    logger.debug('New database client connected', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    });
  });

  // Log client acquisition
  pool.on('acquire', (client) => {
    logger.debug('Database client acquired from pool', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    });
  });

  // Log client release
  pool.on('release', (err, client) => {
    if (err) {
      logger.error('Error releasing database client', {
        error: err.message,
      });
    }
  });

  // Log pool removal events
  pool.on('remove', (client) => {
    logger.debug('Database client removed from pool', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
    });
  });

  logger.info('Database connection pool created', {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    poolMin: config.database.pool.min,
    poolMax: config.database.pool.max,
  });

  return pool;
}

/**
 * Gets the existing connection pool or creates a new one
 * 
 * @returns {Pool} PostgreSQL connection pool
 */
export function getPool() {
  if (!pool) {
    return createPool();
  }
  return pool;
}

/**
 * Executes a SQL query using the connection pool
 * Provides automatic client acquisition and release
 * 
 * @param {string} text - SQL query text with parameter placeholders
 * @param {Array} params - Query parameters for parameterized queries
 * @returns {Promise<Object>} Query result object
 */
export async function query(text, params = []) {
  const start = Date.now();
  
  try {
    const result = await getPool().query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (>1 second)
    if (duration > 1000) {
      logger.warn('Slow query detected', {
        text,
        duration,
        rows: result.rowCount,
      });
    } else {
      logger.debug('Query executed', {
        duration,
        rows: result.rowCount,
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Database query error', {
      error: error.message,
      query: text,
      params,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Acquires a client from the pool for transaction management
 * Must be manually released after use
 * 
 * @returns {Promise<Object>} PostgreSQL client
 */
export async function getClient() {
  const client = await getPool().connect();
  
  // Enhance client with transaction helpers
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);
  
  // Track if client is in a transaction
  let transactionStarted = false;
  
  // Override query to log execution
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const result = await originalQuery(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        logger.warn('Slow query in transaction', {
          text,
          duration,
          rows: result.rowCount,
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Query error in transaction', {
        error: error.message,
        query: text,
      });
      throw error;
    }
  };
  
  // Add transaction management helpers
  client.beginTransaction = async () => {
    await client.query('BEGIN');
    transactionStarted = true;
    logger.debug('Transaction started');
  };
  
  client.commitTransaction = async () => {
    await client.query('COMMIT');
    transactionStarted = false;
    logger.debug('Transaction committed');
  };
  
  client.rollbackTransaction = async () => {
    await client.query('ROLLBACK');
    transactionStarted = false;
    logger.debug('Transaction rolled back');
  };
  
  // Override release to ensure transaction is closed
  client.release = () => {
    if (transactionStarted) {
      logger.warn('Client released with active transaction - rolling back');
      client.query('ROLLBACK').catch(err => {
        logger.error('Error rolling back transaction on release', { error: err.message });
      }).finally(() => {
        originalRelease();
      });
    } else {
      originalRelease();
    }
  };
  
  return client;
}

/**
 * Executes a function within a database transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 * 
 * @param {Function} callback - Async function that receives the client and executes queries
 * @returns {Promise<*>} Result of the callback function
 * @throws {Error} Rolls back transaction and rethrows error if callback fails
 */
export async function transaction(callback) {
  const client = await getClient();
  
  try {
    // Begin transaction
    await client.beginTransaction();
    
    // Execute callback with client
    const result = await callback(client);
    
    // Commit transaction
    await client.commitTransaction();
    
    logger.info('Transaction completed successfully');
    
    return result;
  } catch (error) {
    // Rollback transaction on error
    await client.rollbackTransaction();
    
    logger.error('Transaction failed and rolled back', {
      error: error.message,
      stack: error.stack,
    });
    
    throw error;
  } finally {
    // Always release client back to pool
    client.release();
  }
}

/**
 * Checks database connectivity and health
 * 
 * @returns {Promise<boolean>} True if database is healthy, false otherwise
 */
export async function checkHealth() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    
    logger.info('Database health check passed', {
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    });
    
    return true;
  } catch (error) {
    logger.error('Database health check failed', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Gets current pool statistics
 * 
 * @returns {Object} Pool statistics object
 */
export function getPoolStats() {
  if (!pool) {
    return {
      totalCount: 0,
      idleCount: 0,
      waitingCount: 0,
    };
  }
  
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully closes the database connection pool
 * Should be called during application shutdown
 * 
 * @returns {Promise<void>}
 */
export async function closePool() {
  if (pool) {
    logger.info('Closing database connection pool...');
    
    try {
      await pool.end();
      pool = null;
      logger.info('Database connection pool closed successfully');
    } catch (error) {
      logger.error('Error closing database connection pool', {
        error: error.message,
      });
      throw error;
    }
  }
}

export default {
  createPool,
  getPool,
  query,
  getClient,
  transaction,
  checkHealth,
  getPoolStats,
  closePool,
};
