/**
 * Security Tests
 * Tests for common security vulnerabilities
 */

import request from 'supertest';
import app from '../../src/app.js';

describe('Security Tests', () => {
  describe('SQL Injection Prevention', () => {
    it('should sanitize SQL injection in email field', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: maliciousEmail,
          password: 'password123',
        });
      
      // Should return validation error, not SQL error
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
    
    it('should prevent SQL injection in search queries', async () => {
      const maliciousSearch = "1' OR '1'='1";
      
      const response = await request(app)
        .get('/api/v1/products/search')
        .query({ q: maliciousSearch });
      
      // Should handle gracefully
      expect([200, 400]).toContain(response.status);
    });
  });
  
  describe('XSS Protection', () => {
    it('should sanitize XSS in product title', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: xssPayload,
          description: 'Test product',
          price: 1000,
        });
      
      // Should either reject or escape the payload
      if (response.status === 201) {
        expect(response.body.data.product.title).not.toContain('<script>');
      }
    });
  });
  
  describe('Authentication Security', () => {
    it('should enforce rate limiting on login', async () => {
      const requests = [];
      
      // Attempt 10 rapid logins
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword',
            })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
    
    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: '123', // Weak password
          name: 'Test User',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
    
    it('should not leak user existence in login errors', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      
      // Generic error message
      expect(response.body.message).not.toContain('not found');
      expect(response.body.message).not.toContain('does not exist');
    });
  });
  
  describe('Authorization Security', () => {
    it('should prevent unauthorized access to admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', 'Bearer customer-token');
      
      expect(response.status).toBe(403);
    });
    
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/v1/orders');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('CSRF Protection', () => {
    it('should reject state-changing requests without proper headers', async () => {
      // This test depends on your CSRF implementation
      const response = await request(app)
        .post('/api/v1/orders')
        .send({
          items: [],
          shippingAddress: {},
        });
      
      // Should require authentication at minimum
      expect(response.status).toBe(401);
    });
  });
  
  describe('File Upload Security', () => {
    it('should reject non-image file uploads', async () => {
      const response = await request(app)
        .post('/api/v1/media/upload')
        .set('Authorization', 'Bearer admin-token')
        .attach('file', Buffer.from('<?php system($_GET["cmd"]); ?>'), 'shell.php');
      
      // Should reject non-image files
      expect([400, 415]).toContain(response.status);
    });
  });
  
  describe('Session Security', () => {
    it('should invalidate session on logout', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@1234',
        });
      
      const accessToken = loginResponse.body.data?.accessToken;
      
      if (accessToken) {
        // Logout
        await request(app)
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${accessToken}`);
        
        // Try to use token again
        const response = await request(app)
          .get('/api/v1/auth/sessions')
          .set('Authorization', `Bearer ${accessToken}`);
        
        // Token should be invalid
        expect(response.status).toBe(401);
      }
    });
  });
  
  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      const response = await request(app).get('/healthz');
      
      // Helmet headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
  
  describe('Input Validation', () => {
    it('should reject requests with invalid data types', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Product',
          price: 'not-a-number', // Invalid type
        });
      
      expect(response.status).toBe(400);
    });
    
    it('should enforce maximum request size', async () => {
      const largePayload = 'x'.repeat(2 * 1024 * 1024); // 2MB
      
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Product',
          description: largePayload,
          price: 1000,
        });
      
      // Should reject or handle large payloads
      expect([400, 413]).toContain(response.status);
    });
  });
});
