/**
 * Payments Integration Tests
 * @module tests/integration/payments
 */

import request from 'supertest';
import app from '../../src/app.js';
import { query } from '../../src/config/database.js';

describe('Payments Integration Tests', () => {
  let authToken;
  let orderId;
  
  beforeAll(async () => {
    // Register and login test user
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@payments.com',
        password: 'Test@1234',
        name: 'Test User',
      });
    
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@payments.com',
        password: 'Test@1234',
      });
    
    authToken = loginRes.body.data.accessToken;
    
    // Create test order
    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [
          {
            productId: 'test-product-id',
            quantity: 1,
          },
        ],
        shippingAddress: {
          fullName: 'Test User',
          phone: '1234567890',
          address: '123 Test St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
        },
      });
    
    orderId = orderRes.body.data.order.id;
  });
  
  describe('POST /api/v1/payments/initialize', () => {
    it('should initialize payment successfully', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId,
          amount: 10000,
        });
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('authorizationUrl');
      expect(res.body.data).toHaveProperty('reference');
    });
    
    it('should reject payment for invalid order', async () => {
      const res = await request(app)
        .post('/api/v1/payments/initialize')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: 'invalid-order-id',
          amount: 10000,
        });
      
      expect(res.status).toBe(404);
    });
  });
  
  describe('POST /api/v1/payments/webhook', () => {
    it('should process webhook with valid signature', async () => {
      // Mock webhook event
      const webhookPayload = {
        event: 'charge.success',
        data: {
          reference: 'test-reference',
          amount: 1000000,
          status: 'success',
          gateway_response: 'Successful',
        },
      };
      
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', 'test-signature')
        .send(webhookPayload);
      
      expect(res.status).toBe(200);
    });
    
    it('should prevent duplicate webhook processing', async () => {
      const webhookPayload = {
        event: 'charge.success',
        data: {
          reference: 'duplicate-reference',
          id: 'same-event-id',
          amount: 1000000,
        },
      };
      
      // Send same webhook twice
      await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', 'test-signature')
        .send(webhookPayload);
      
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-paystack-signature', 'test-signature')
        .send(webhookPayload);
      
      expect(res.body.data.status).toBe('duplicate');
    });
  });
  
  afterAll(async () => {
    // Cleanup test data
    await query('DELETE FROM users WHERE email = $1', ['test@payments.com']);
  });
});
