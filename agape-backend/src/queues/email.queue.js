/**
 * Email Queue Processor
 * Handles asynchronous email sending with retry logic
 * @module queues/email
 */

import { createQueue, createWorker, createScheduler } from './queue.config.js';
import * as notificationsService from '../services/notifications/notifications.service.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'email';

/**
 * Email queue instance
 */
export const emailQueue = createQueue(QUEUE_NAME);

/**
 * Email queue scheduler
 */
export const emailScheduler = createScheduler(QUEUE_NAME);

/**
 * Job types
 */
export const EmailJobTypes = {
  WELCOME: 'welcome',
  ORDER_CONFIRMATION: 'order_confirmation',
  PASSWORD_RESET: 'password_reset',
  PAYMENT_RECEIPT: 'payment_receipt',
  SHIPMENT_NOTIFICATION: 'shipment_notification',
};

/**
 * Adds welcome email job to queue
 */
export async function queueWelcomeEmail(email, userName, verificationToken) {
  return await emailQueue.add(
    EmailJobTypes.WELCOME,
    { email, userName, verificationToken },
    { priority: 1 }
  );
}

/**
 * Adds order confirmation email job to queue
 */
export async function queueOrderConfirmation(email, orderData) {
  return await emailQueue.add(
    EmailJobTypes.ORDER_CONFIRMATION,
    { email, orderData },
    { priority: 2 }
  );
}

/**
 * Adds password reset email job to queue
 */
export async function queuePasswordReset(email, userName, resetToken) {
  return await emailQueue.add(
    EmailJobTypes.PASSWORD_RESET,
    { email, userName, resetToken },
    { priority: 1 }
  );
}

/**
 * Adds payment receipt email job to queue
 */
export async function queuePaymentReceipt(email, paymentData) {
  return await emailQueue.add(
    EmailJobTypes.PAYMENT_RECEIPT,
    { email, paymentData },
    { priority: 2 }
  );
}

/**
 * Adds shipment notification email job to queue
 */
export async function queueShipmentNotification(email, orderNumber, trackingNumber) {
  return await emailQueue.add(
    EmailJobTypes.SHIPMENT_NOTIFICATION,
    { email, orderNumber, trackingNumber },
    { priority: 3 }
  );
}

/**
 * Email job processor
 */
async function processEmailJob(job) {
  const { name, data } = job;
  
  logger.info(`Processing email job: ${name}`, { jobId: job.id });
  
  try {
    switch (name) {
      case EmailJobTypes.WELCOME:
        await notificationsService.sendWelcomeEmail(
          data.email,
          data.userName,
          data.verificationToken
        );
        break;
      
      case EmailJobTypes.ORDER_CONFIRMATION:
        await notificationsService.sendOrderConfirmation(
          data.email,
          data.orderData
        );
        break;
      
      case EmailJobTypes.PASSWORD_RESET:
        await notificationsService.sendPasswordReset(
          data.email,
          data.userName,
          data.resetToken
        );
        break;
      
      case EmailJobTypes.PAYMENT_RECEIPT:
        await notificationsService.sendPaymentReceipt(
          data.email,
          data.paymentData
        );
        break;
      
      case EmailJobTypes.SHIPMENT_NOTIFICATION:
        await notificationsService.sendShipmentNotification(
          data.email,
          data.orderNumber,
          data.trackingNumber
        );
        break;
      
      default:
        throw new Error(`Unknown email job type: ${name}`);
    }
    
    logger.info(`Email sent successfully: ${name}`, {
      jobId: job.id,
      email: data.email,
    });
  } catch (error) {
    logger.error(`Email job failed: ${name}`, {
      jobId: job.id,
      error: error.message,
      email: data.email,
    });
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Email worker instance
 */
export const emailWorker = createWorker(QUEUE_NAME, processEmailJob, {
  concurrency: 5,
});

/**
 * Gets queue statistics
 */
export async function getEmailQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);
  
  return { waiting, active, completed, failed, delayed };
}

export default {
  emailQueue,
  emailWorker,
  queueWelcomeEmail,
  queueOrderConfirmation,
  queuePasswordReset,
  queuePaymentReceipt,
  queueShipmentNotification,
  getEmailQueueStats,
};
