/**
 * Server Entry Point
 * @module server
 */

import app from './app.js';
import config, { validateConfig } from './config/index.js';
import { createPool, closePool, checkHealth } from './config/database.js';
import { createRedisClient, closeRedis, checkRedisHealth } from './config/redis.js';
import logger from './utils/logger.js';

/**
 * Starts the server
 */
async function startServer() {
  try {
    // Validate configuration
    logger.info('Validating configuration...');
    validateConfig();
    
    // Initialize database connection pool
    logger.info('Initializing database connection...');
    createPool();
    
    const dbHealthy = await checkHealth();
    if (!dbHealthy) {
      throw new Error('Database health check failed');
    }
    
    // Initialize Redis connection
    logger.info('Initializing Redis connection...');
    createRedisClient();
    
    const redisHealthy = await checkRedisHealth();
    if (!redisHealthy) {
      logger.warn('Redis health check failed - some features may be degraded');
    }
    
    // Start HTTP server
    const server = app.listen(config.app.port, () => {
      logger.info(`🚀 ${config.app.name} started successfully`, {
        port: config.app.port,
        environment: config.app.env,
        nodeVersion: process.version,
        pid: process.pid,
      });
      
      logger.info(`📡 API available at http://localhost:${config.app.port}/api/${config.app.apiVersion}`);
      logger.info(`💚 Health check at http://localhost:${config.app.port}/healthz`);
    });
    
    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connections
          await closePool();
          
          // Close Redis connections
          await closeRedis();
          
          logger.info('All connections closed. Exiting process.');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });
      
      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled rejection', {
        reason,
        promise,
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Start server
startServer();
