/**
 * Payments Service
 * Handles Paystack payment initialization and verification
 * @module lib/services/payments
 */

import apiClient from '../api/client'

// Payment response interfaces
export interface PaymentInitResponse {
  paymentId: string
  authorizationUrl: string
  accessCode: string
  reference: string
}

export interface PaymentVerifyResponse {
  status: 'success' | 'failed' | 'pending'
  amount: number
  currency: string
  reference: string
  orderId: string
}

/**
 * Payments Service Class
 * Provides methods for payment operations via Paystack
 */
class PaymentsService {
  /**
   * Initialize payment for an order
   * Returns Paystack authorization URL to redirect user
   */
  async initializePayment(orderId: string): Promise<PaymentInitResponse> {
    const response = await apiClient.post('/payments/initialize', { orderId })
    return response.data
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string): Promise<PaymentVerifyResponse> {
    const response = await apiClient.post(`/payments/${paymentId}/verify`)
    return response.data
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<any> {
    const response = await apiClient.get(`/payments/${paymentId}`)
    return response.data
  }
}

// Export singleton instance
export const paymentsService = new PaymentsService()
