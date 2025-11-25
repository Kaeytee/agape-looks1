/**
 * Payment Reconciliation Queue
 * Daily job to reconcile Paystack transactions with orders
 * @module queues/reconciliation
 */

import { createQueue, createWorker, createScheduler } from './queue.config.js';
import { query } from '../config/database.js';
import * as paystackClient from '../integrations/paystack.client.js';
import logger from '../utils/logger.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_NAME = 'reconciliation';

/**
 * Reconciliation queue instance
 */
export const reconciliationQueue = createQueue(QUEUE_NAME);

/**
 * Reconciliation queue scheduler
 */
export const reconciliationScheduler = createScheduler(QUEUE_NAME);

/**
 * Schedules daily reconciliation job (2 AM daily)
 */
export async function scheduleDailyReconciliation() {
  // Add repeatable job
  await reconciliationQueue.add(
    'daily_reconciliation',
    {},
    {
      repeat: {
        pattern: '0 2 * * *', // 2 AM daily
      },
      priority: 1,
    }
  );
  
  logger.info('Daily reconciliation job scheduled');
}

/**
 * Manually triggers reconciliation for a date range
 */
export async function queueManualReconciliation(fromDate, toDate) {
  return await reconciliationQueue.add(
    'manual_reconciliation',
    { fromDate, toDate },
    { priority: 2 }
  );
}

/**
 * Reconciliation job processor
 */
async function processReconciliationJob(job) {
  const { fromDate, toDate } = job.data;
  
  // Default to yesterday if no dates provided
  const from = fromDate || new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const to = toDate || new Date().toISOString().split('T')[0];
  
  logger.info('Processing reconciliation job', {
    jobId: job.id,
    from,
    to,
  });
  
  try {
    // Fetch Paystack transactions
    const paystackTransactions = await paystackClient.exportTransactionsForReconciliation(from, to);
    
    // Fetch our payment records
    const localPayments = await query(
      `SELECT p.gateway_ref, p.amount, p.currency, p.status, o.order_number
       FROM payments p
       LEFT JOIN orders o ON p.order_id = o.id
       WHERE p.created_at::date BETWEEN $1 AND $2
       AND p.gateway = 'paystack'`,
      [from, to]
    );
    
    // Build maps for comparison
    const paystackMap = new Map();
    paystackTransactions.forEach(txn => {
      paystackMap.set(txn.reference, txn);
    });
    
    const localMap = new Map();
    localPayments.rows.forEach(payment => {
      localMap.set(payment.gateway_ref, payment);
    });
    
    // Find mismatches
    const mismatches = [];
    const matches = [];
    
    // Check local payments against Paystack
    for (const [reference, localPayment] of localMap) {
      const paystackTxn = paystackMap.get(reference);
      
      if (!paystackTxn) {
        mismatches.push({
          reference,
          issue: 'MISSING_IN_PAYSTACK',
          localAmount: localPayment.amount,
          localStatus: localPayment.status,
          orderNumber: localPayment.order_number,
        });
      } else if (Math.abs(paystackTxn.amount - localPayment.amount) > 0.01) {
        mismatches.push({
          reference,
          issue: 'AMOUNT_MISMATCH',
          localAmount: localPayment.amount,
          paystackAmount: paystackTxn.amount,
          difference: paystackTxn.amount - localPayment.amount,
          orderNumber: localPayment.order_number,
        });
      } else {
        matches.push({
          reference,
          amount: localPayment.amount,
          status: localPayment.status,
          orderNumber: localPayment.order_number,
        });
      }
    }
    
    // Check Paystack transactions missing in local
    for (const [reference, paystackTxn] of paystackMap) {
      if (!localMap.has(reference)) {
        mismatches.push({
          reference,
          issue: 'MISSING_IN_LOCAL',
          paystackAmount: paystackTxn.amount,
          paystackStatus: paystackTxn.status,
        });
      }
    }
    
    // Generate CSV report
    const reportPath = await generateReconciliationReport(from, to, matches, mismatches);
    
    // Store reconciliation result
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, changes)
       VALUES (NULL, 'reconciliation_completed', 'payments', NULL, $1)`,
      [JSON.stringify({
        from,
        to,
        totalMatches: matches.length,
        totalMismatches: mismatches.length,
        reportPath,
      })]
    );
    
    logger.info('Reconciliation completed', {
      jobId: job.id,
      from,
      to,
      matches: matches.length,
      mismatches: mismatches.length,
    });
    
    // TODO: Send email notification with report to finance team
    
    return {
      from,
      to,
      matches: matches.length,
      mismatches: mismatches.length,
      reportPath,
    };
  } catch (error) {
    logger.error('Reconciliation failed', {
      jobId: job.id,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Generates CSV reconciliation report
 */
async function generateReconciliationReport(from, to, matches, mismatches) {
  const timestamp = Date.now();
  const fileName = `reconciliation_${from}_${to}_${timestamp}.csv`;
  const filePath = path.join(__dirname, '../../reports', fileName);
  
  // Ensure reports directory exists
  const fs = await import('fs');
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'type', title: 'Type' },
      { id: 'reference', title: 'Reference' },
      { id: 'orderNumber', title: 'Order Number' },
      { id: 'issue', title: 'Issue' },
      { id: 'localAmount', title: 'Local Amount' },
      { id: 'paystackAmount', title: 'Paystack Amount' },
      { id: 'difference', title: 'Difference' },
      { id: 'status', title: 'Status' },
    ],
  });
  
  const records = [
    ...matches.map(m => ({
      type: 'MATCH',
      reference: m.reference,
      orderNumber: m.orderNumber,
      issue: '',
      localAmount: m.amount,
      paystackAmount: m.amount,
      difference: 0,
      status: m.status,
    })),
    ...mismatches.map(m => ({
      type: 'MISMATCH',
      reference: m.reference,
      orderNumber: m.orderNumber || '',
      issue: m.issue,
      localAmount: m.localAmount || '',
      paystackAmount: m.paystackAmount || '',
      difference: m.difference || '',
      status: m.localStatus || m.paystackStatus || '',
    })),
  ];
  
  await csvWriter.writeRecords(records);
  
  return filePath;
}

/**
 * Reconciliation worker instance
 */
export const reconciliationWorker = createWorker(QUEUE_NAME, processReconciliationJob, {
  concurrency: 1, // Process one at a time
});

export default {
  reconciliationQueue,
  reconciliationWorker,
  scheduleDailyReconciliation,
  queueManualReconciliation,
};
