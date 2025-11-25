/**
 * Redis Configuration and Connection Management
 * @module config/redis
 */

import Redis from 'ioredis';
import config from './index.js';
import logger from '../utils/logger.js';

let redisClient = null;

/**
 * Creates Redis client with retry logic
 */
export function createRedisClient() {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    keyPrefix: config.redis.keyPrefix,
    retryStrategy: config.redis.retryStrategy,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('ready', () => logger.info('Redis ready'));
  redisClient.on('error', (err) => logger.error('Redis error', { error: err.message }));
  redisClient.on('close', () => logger.warn('Redis connection closed'));
  redisClient.on('reconnecting', () => logger.info('Redis reconnecting'));

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) return createRedisClient();
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export async function checkRedisHealth() {
  try {
    await getRedisClient().ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return false;
  }
}

export default { createRedisClient, getRedisClient, closeRedis, checkRedisHealth };
