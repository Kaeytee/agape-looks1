/**
 * Notifications Service
 * @module services/notifications
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database.js';
import * as resendClient from '../../integrations/resend.client.js';
import logger from '../../utils/logger.js';

/**
 * Sends welcome email
 */
export async function sendWelcomeEmail(email, userName, verificationToken) {
  const verificationUrl = `${process.env.EMAIL_VERIFICATION_URL}?token=${verificationToken}`;
  const template = resendClient.templates.welcomeEmail(userName, verificationUrl);
  
  return await resendClient.sendEmail({
    to: email,
    ...template,
    tags: [{ name: 'type', value: 'welcome' }],
  });
}

/**
 * Sends order confirmation email
 */
export async function sendOrderConfirmation(email, orderData) {
  const { orderNumber, total, items } = orderData;
  const template = resendClient.templates.orderConfirmation(orderNumber, total, items);
  
  return await resendClient.sendEmail({
    to: email,
    ...template,
    tags: [{ name: 'type', value: 'order_confirmation' }],
  });
}

/**
 * Sends password reset email
 */
export async function sendPasswordReset(email, userName, resetToken) {
  const resetUrl = `${process.env.PASSWORD_RESET_URL}?token=${resetToken}`;
  const template = resendClient.templates.passwordReset(userName, resetUrl);
  
  return await resendClient.sendEmail({
    to: email,
    ...template,
    tags: [{ name: 'type', value: 'password_reset' }],
  });
}

/**
 * Sends payment receipt
 */
export async function sendPaymentReceipt(email, paymentData) {
  const { orderNumber, amount, paymentMethod } = paymentData;
  const template = resendClient.templates.paymentReceipt(orderNumber, amount, paymentMethod);
  
  return await resendClient.sendEmail({
    to: email,
    ...template,
    tags: [{ name: 'type', value: 'payment_receipt' }],
  });
}

/**
 * Sends shipment notification
 */
export async function sendShipmentNotification(email, orderNumber, trackingNumber) {
  const template = resendClient.templates.shipmentNotification(orderNumber, trackingNumber);
  
  return await resendClient.sendEmail({
    to: email,
    ...template,
    tags: [{ name: 'type', value: 'shipment' }],
  });
}

export default {
  sendWelcomeEmail,
  sendOrderConfirmation,
  sendPasswordReset,
  sendPaymentReceipt,
  sendShipmentNotification,
};
