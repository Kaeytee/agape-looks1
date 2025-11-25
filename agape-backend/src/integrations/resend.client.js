/**
 * Resend Email Client
 * @module integrations/resend
 */

import { Resend } from 'resend';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ExternalServiceError } from '../utils/errors.js';

const resend = new Resend(config.resend.apiKey);

/**
 * Sends an email via Resend
 */
export async function sendEmail(params) {
  const { to, subject, html, text, tags = [] } = params;
  
  try {
    const result = await resend.emails.send({
      from: `${config.resend.fromName} <${config.resend.fromEmail}>`,
      to,
      subject,
      html,
      text,
      reply_to: config.resend.replyTo,
      tags,
    });
    
    logger.info('Email sent successfully', {
      to,
      subject,
      messageId: result.id,
    });
    
    return result;
  } catch (error) {
    logger.error('Email send failed', {
      to,
      subject,
      error: error.message,
    });
    throw new ExternalServiceError('Resend', error.message);
  }
}

/**
 * Email templates
 */
export const templates = {
  welcomeEmail: (userName, verificationUrl) => ({
  subject: 'Welcome to AGAPE LOOKS',
    html: `
      <h1>Welcome ${userName}!</h1>
  <p>Thank you for joining AGAPE LOOKS.</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `,
    text: `Welcome ${userName}! Verify your email: ${verificationUrl}`,
  }),
  
  orderConfirmation: (orderNumber, total, items) => ({
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <h1>Order Confirmed</h1>
      <p>Your order ${orderNumber} has been confirmed.</p>
      <p>Total: ${total}</p>
      <h3>Items:</h3>
      <ul>${items.map(item => `<li>${item.title} x ${item.quantity}</li>`).join('')}</ul>
    `,
    text: `Order ${orderNumber} confirmed. Total: ${total}`,
  }),
  
  passwordReset: (userName, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${userName},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `,
    text: `Reset your password: ${resetUrl}`,
  }),
  
  paymentReceipt: (orderNumber, amount, paymentMethod) => ({
    subject: `Payment Receipt - ${orderNumber}`,
    html: `
      <h1>Payment Receipt</h1>
      <p>Payment received for order ${orderNumber}</p>
      <p>Amount: ${amount}</p>
      <p>Method: ${paymentMethod}</p>
    `,
    text: `Payment received for ${orderNumber}: ${amount}`,
  }),
  
  shipmentNotification: (orderNumber, trackingNumber) => ({
    subject: `Your Order Has Shipped - ${orderNumber}`,
    html: `
      <h1>Order Shipped</h1>
      <p>Your order ${orderNumber} has been shipped.</p>
      <p>Tracking: ${trackingNumber}</p>
    `,
    text: `Order ${orderNumber} shipped. Tracking: ${trackingNumber}`,
  }),
};

export default { sendEmail, templates };
