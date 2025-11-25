/**
 * Payments Service Unit Tests
 */

import * as paymentsService from '../../src/services/payments/payments.service.js';
import * as paystackClient from '../../src/integrations/paystack.client.js';
import { transaction } from '../../src/config/database.js';

jest.mock('../../src/integrations/paystack.client.js');
jest.mock('../../src/config/database.js');

describe('Payments Service', () => {
  describe('initializePayment', () => {
    it('should initialize payment successfully', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({ rows: [{ id: 'payment-id' }] }) // Insert payment
          .mockResolvedValueOnce({ rows: [] }), // Update payment
      };
      
      transaction.mockImplementation(async (callback) => {
        return await callback(mockClient);
      });
      
      paystackClient.generateTransactionReference.mockReturnValue('TXN_123');
      paystackClient.initializeTransaction.mockResolvedValue({
        authorization_url: 'https://checkout.paystack.com/abc',
        access_code: 'abc123',
      });
      
      const result = await paymentsService.initializePayment({
        orderId: 'order-id',
        userId: 'user-id',
        email: 'test@example.com',
        amount: 10000,
      });
      
      expect(result).toHaveProperty('authorizationUrl');
      expect(result).toHaveProperty('reference');
      expect(paystackClient.initializeTransaction).toHaveBeenCalled();
    });
  });
  
  describe('verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const mockClient = {
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{
              id: 'payment-id',
              order_id: 'order-id',
              status: 'initialized',
              amount: 100,
            }],
          })
          .mockResolvedValueOnce({ rows: [] }) // Update payment
          .mockResolvedValueOnce({ rows: [] }) // Update order
          .mockResolvedValueOnce({ rows: [] }), // Audit log
      };
      
      transaction.mockImplementation(async (callback) => {
        return await callback(mockClient);
      });
      
      paystackClient.verifyTransaction.mockResolvedValue({
        status: 'success',
        amount: 10000,
        gateway_response: 'Successful',
      });
      
      paystackClient.isTransactionSuccessful.mockReturnValue(true);
      
      const result = await paymentsService.verifyPayment('TXN_123');
      
      expect(result.status).toBe('success');
      expect(result).toHaveProperty('paymentId');
    });
    
    it('should prevent duplicate processing', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValueOnce({
          rows: [{
            id: 'payment-id',
            status: 'paid',
          }],
        }),
      };
      
      transaction.mockImplementation(async (callback) => {
        return await callback(mockClient);
      });
      
      paystackClient.verifyTransaction.mockResolvedValue({
        status: 'success',
        amount: 10000,
      });
      
      paystackClient.isTransactionSuccessful.mockReturnValue(true);
      
      const result = await paymentsService.verifyPayment('TXN_123');
      
      expect(result.status).toBe('already_processed');
    });
  });
});
