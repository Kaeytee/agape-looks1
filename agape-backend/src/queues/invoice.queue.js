/**
 * Invoice Generation Queue
 * Handles PDF invoice generation asynchronously
 * @module queues/invoice
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createQueue, createWorker, createScheduler } from './queue.config.js';
import { query } from '../config/database.js';
import * as cloudinaryClient from '../integrations/cloudinary.client.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUEUE_NAME = 'invoice';

/**
 * Invoice queue instance
 */
export const invoiceQueue = createQueue(QUEUE_NAME);

/**
 * Invoice queue scheduler
 */
export const invoiceScheduler = createScheduler(QUEUE_NAME);

/**
 * Adds invoice generation job to queue
 */
export async function queueInvoiceGeneration(orderId) {
  return await invoiceQueue.add(
    'generate_invoice',
    { orderId },
    { priority: 2 }
  );
}

/**
 * Generates invoice PDF
 */
async function generateInvoicePDF(orderData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice_${orderData.order_number}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../uploads', fileName);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    const stream = fs.createWriteStream(filePath);
    
    doc.pipe(stream);
    
    // Header
  doc.fontSize(20).text('AGAPE LOOKS', { align: 'center' });
    doc.fontSize(10).text('Traditional African Fabrics', { align: 'center' });
    doc.moveDown();
    
    // Invoice title
    doc.fontSize(16).text('INVOICE', { align: 'center' });
    doc.moveDown();
    
    // Invoice details
    doc.fontSize(10);
    doc.text(`Invoice Number: ${orderData.order_number}`);
    doc.text(`Date: ${new Date(orderData.created_at).toLocaleDateString()}`);
    doc.text(`Status: ${orderData.status.toUpperCase()}`);
    doc.moveDown();
    
    // Customer details
    doc.fontSize(12).text('Bill To:', { underline: true });
    doc.fontSize(10);
    const shippingAddr = orderData.shipping_address;
    doc.text(shippingAddr.fullName);
    doc.text(shippingAddr.address);
    doc.text(`${shippingAddr.city}, ${shippingAddr.state}`);
    doc.text(shippingAddr.country);
    doc.text(`Phone: ${shippingAddr.phone}`);
    doc.moveDown();
    
    // Items table header
    doc.fontSize(12).text('Items:', { underline: true });
    doc.moveDown(0.5);
    
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 380;
    const totalX = 460;
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Item', itemX, tableTop);
    doc.text('Qty', qtyX, tableTop);
    doc.text('Price', priceX, tableTop);
    doc.text('Total', totalX, tableTop);
    doc.moveDown();
    
    // Items
    doc.font('Helvetica');
    orderData.items.forEach((item) => {
      const y = doc.y;
      const itemTotal = item.quantity * item.price_snapshot;
      
      doc.text(item.metadata.productTitle || 'Product', itemX, y, { width: 240 });
      doc.text(item.quantity.toString(), qtyX, y);
      doc.text(`₦${item.price_snapshot.toLocaleString()}`, priceX, y);
      doc.text(`₦${itemTotal.toLocaleString()}`, totalX, y);
      doc.moveDown();
    });
    
    // Totals
    doc.moveDown();
    const totalsX = 380;
    doc.text(`Subtotal: ₦${orderData.subtotal.toLocaleString()}`, totalsX);
    if (orderData.tax > 0) {
      doc.text(`Tax: ₦${orderData.tax.toLocaleString()}`, totalsX);
    }
    if (orderData.shipping > 0) {
      doc.text(`Shipping: ₦${orderData.shipping.toLocaleString()}`, totalsX);
    }
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Total: ₦${orderData.total.toLocaleString()}`, totalsX);
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica');
    doc.text('Thank you for your business!', { align: 'center' });
  doc.text('For inquiries: support@agapelooks.com', { align: 'center' });
    
    doc.end();
    
    stream.on('finish', () => {
      resolve(filePath);
    });
    
    stream.on('error', reject);
  });
}

/**
 * Invoice job processor
 */
async function processInvoiceJob(job) {
  const { orderId } = job.data;
  
  logger.info('Processing invoice generation job', { jobId: job.id, orderId });
  
  try {
    // Get order details with items
    const result = await query(
      `SELECT o.*, 
              json_agg(
                json_build_object(
                  'quantity', oi.quantity,
                  'price_snapshot', oi.price_snapshot,
                  'metadata', oi.metadata
                )
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [orderId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const orderData = result.rows[0];
    orderData.shipping_address = JSON.parse(orderData.shipping_address || '{}');
    
    // Generate PDF
    const pdfPath = await generateInvoicePDF(orderData);
    
    // Upload to Cloudinary
    const uploadResult = await cloudinaryClient.uploadImage(pdfPath, {
      folder: 'invoices',
      resource_type: 'raw',
    });
    
    // Update order with invoice URL
    await query(
      `UPDATE orders 
       SET metadata = metadata || $1
       WHERE id = $2`,
      [JSON.stringify({ invoiceUrl: uploadResult.url }), orderId]
    );
    
    // Delete local file
    fs.unlinkSync(pdfPath);
    
    logger.info('Invoice generated successfully', {
      jobId: job.id,
      orderId,
      invoiceUrl: uploadResult.url,
    });
    
    return { invoiceUrl: uploadResult.url };
  } catch (error) {
    logger.error('Invoice generation failed', {
      jobId: job.id,
      orderId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Invoice worker instance
 */
export const invoiceWorker = createWorker(QUEUE_NAME, processInvoiceJob, {
  concurrency: 2,
});

export default {
  invoiceQueue,
  invoiceWorker,
  queueInvoiceGeneration,
};
