/**
 * Queue Manager - Centralized queue initialization
 * @module queues
 */

import { emailQueue, emailWorker, emailScheduler } from './email.queue.js';
import { invoiceQueue, invoiceWorker, invoiceScheduler } from './invoice.queue.js';
import { reconciliationQueue, reconciliationWorker, reconciliationScheduler, scheduleDailyReconciliation } from './reconciliation.queue.js';
import logger from '../utils/logger.js';

/**
 * Initializes all queues and workers
 */
export async function initializeQueues() {
  logger.info('Initializing queues and workers...');
  
  try {
    // Schedule recurring jobs
    await scheduleDailyReconciliation();
    
    logger.info('All queues initialized successfully');
    
    return {
      email: { queue: emailQueue, worker: emailWorker, scheduler: emailScheduler },
      invoice: { queue: invoiceQueue, worker: invoiceWorker, scheduler: invoiceScheduler },
      reconciliation: { queue: reconciliationQueue, worker: reconciliationWorker, scheduler: reconciliationScheduler },
    };
  } catch (error) {
    logger.error('Queue initialization failed', { error: error.message });
    throw error;
  }
}

/**
 * Gracefully shuts down all queues and workers
 */
export async function shutdownQueues() {
  logger.info('Shutting down queues and workers...');
  
  try {
    await Promise.all([
      emailWorker.close(),
      invoiceWorker.close(),
      reconciliationWorker.close(),
      emailQueue.close(),
      invoiceQueue.close(),
      reconciliationQueue.close(),
    ]);
    
    logger.info('All queues shut down successfully');
  } catch (error) {
    logger.error('Queue shutdown error', { error: error.message });
    throw error;
  }
}

/**
 * Gets statistics for all queues
 */
export async function getAllQueueStats() {
  const [emailStats, invoiceStats, reconciliationStats] = await Promise.all([
    getQueueStats(emailQueue),
    getQueueStats(invoiceQueue),
    getQueueStats(reconciliationQueue),
  ]);
  
  return {
    email: emailStats,
    invoice: invoiceStats,
    reconciliation: reconciliationStats,
  };
}

/**
 * Helper to get queue statistics
 */
async function getQueueStats(queue) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return { waiting, active, completed, failed, delayed };
}

export default {
  initializeQueues,
  shutdownQueues,
  getAllQueueStats,
};
