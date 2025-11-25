/**
 * Orders Integration Tests
 * @module tests/integration/orders
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('Orders Integration Tests', () => {
  let authToken;
  let productId;
  let variantId;
  
  beforeAll(async () => {
    // Setup test user and products
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@orders.com',
        password: 'Test@1234',
      });
    
    authToken = loginRes.body.data.accessToken;
  });
  
  describe('POST /api/v1/orders', () => {
    it('should create order successfully', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              variantId: variantId,
              quantity: 2,
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
      
      expect(res.status).toBe(201);
      expect(res.body.data.order).toHaveProperty('id');
      expect(res.body.data.order).toHaveProperty('orderNumber');
      expect(res.body.data.order.status).toBe('pending');
    });
    
    it('should reserve inventory when creating order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              variantId: variantId,
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
      
      expect(res.status).toBe(201);
      
      // Verify inventory was reserved
      const inventoryRes = await request(app)
        .get(`/api/v1/admin/inventory/${variantId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(inventoryRes.body.data.reservations).toHaveLength(1);
    });
    
    it('should prevent overselling', async () => {
      // Attempt to order more than available stock
      const res = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: productId,
              variantId: variantId,
              quantity: 999999,
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
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('GET /api/v1/orders', () => {
    it('should list user orders', async () => {
      const res = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });
  });
});
