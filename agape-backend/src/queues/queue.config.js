/**
 * BullMQ Queue Configuration
 * @module queues/config
 */

import { Queue, Worker, QueueScheduler } from 'bullmq';
import { getRedisClient } from '../config/redis.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';

/**
 * Creates Redis connection for BullMQ
 */
function getQueueConnection() {
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  };
}

/**
 * Default queue options
 */
export const defaultQueueOptions = {
  connection: getQueueConnection(),
  defaultJobOptions: {
    attempts: config.queue.maxRetries,
    backoff: {
      type: config.queue.backoffType,
      delay: config.queue.backoffDelay,
    },
    removeOnComplete: {
      count: 100,
      age: 86400, // 24 hours
    },
    removeOnFail: {
      count: 500,
      age: 604800, // 7 days
    },
  },
};

/**
 * Default worker options
 */
export const defaultWorkerOptions = {
  connection: getQueueConnection(),
  concurrency: config.queue.concurrency,
  autorun: true,
};

/**
 * Creates queue scheduler for delayed/recurring jobs
 */
export function createScheduler(queueName) {
  const scheduler = new QueueScheduler(queueName, {
    connection: getQueueConnection(),
  });
  
  scheduler.on('error', (error) => {
    logger.error(`Queue scheduler error: ${queueName}`, { error: error.message });
  });
  
  return scheduler;
}

/**
 * Creates a queue instance
 */
export function createQueue(queueName, options = {}) {
  const queue = new Queue(queueName, {
    ...defaultQueueOptions,
    ...options,
  });
  
  queue.on('error', (error) => {
    logger.error(`Queue error: ${queueName}`, { error: error.message });
  });
  
  logger.info(`Queue created: ${queueName}`);
  
  return queue;
}

/**
 * Creates a worker instance
 */
export function createWorker(queueName, processor, options = {}) {
  const worker = new Worker(queueName, processor, {
    ...defaultWorkerOptions,
    ...options,
  });
  
  // Worker event handlers
  worker.on('completed', (job) => {
    logger.info(`Job completed: ${queueName}`, {
      jobId: job.id,
      name: job.name,
      duration: Date.now() - job.processedOn,
    });
  });
  
  worker.on('failed', (job, error) => {
    logger.error(`Job failed: ${queueName}`, {
      jobId: job?.id,
      name: job?.name,
      error: error.message,
      attempts: job?.attemptsMade,
    });
  });
  
  worker.on('error', (error) => {
    logger.error(`Worker error: ${queueName}`, { error: error.message });
  });
  
  logger.info(`Worker started: ${queueName}`);
  
  return worker;
}

/**
 * Gracefully closes queue
 */
export async function closeQueue(queue) {
  await queue.close();
  logger.info('Queue closed');
}

/**
 * Gracefully closes worker
 */
export async function closeWorker(worker) {
  await worker.close();
  logger.info('Worker closed');
}

export default {
  createQueue,
  createWorker,
  createScheduler,
  closeQueue,
  closeWorker,
};
