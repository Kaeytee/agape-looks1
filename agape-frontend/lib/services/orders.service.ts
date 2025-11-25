/**
 * Orders Service
 * Handles order creation, fetching, and management
 * @module lib/services/orders
 */

import apiClient from '../api/client'
import { Order, ShippingAddress } from '../types'

// Order creation data interface
export interface CreateOrderData {
  items: Array<{
    productId: string
    variantId?: string
    quantity: number
    price: number
  }>
  shippingAddress: ShippingAddress
  shippingMethod: string
  paymentMethod: string
  notes?: string
}

// Order list response
export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  totalPages: number
}

/**
 * Orders Service Class
 * Provides methods for order operations
 */
class OrdersService {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await apiClient.post('/orders', data)
    return response.data
  }

  /**
   * Get user's orders
   */
  async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    const response = await apiClient.get('/orders', {
      params: { page, limit },
    })
    return response.data
  }

  /**
   * Get single order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get(`/orders/${orderId}`)
    return response.data
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, { reason })
    return response.data
  }

  /**
   * Track order by order number and email (public endpoint)
   */
  async trackOrder(orderNumber: string, email: string): Promise<Order> {
    const response = await apiClient.post('/orders/track', {
      orderNumber,
      email,
    })
    return response.data
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(page: number = 1, limit: number = 20, status?: string): Promise<OrdersResponse> {
    const params: any = { page, limit }
    if (status && status !== 'all') {
      params.status = status
    }
    const response = await apiClient.get('/admin/orders', { params })
    return response.data
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<Order> {
    const response = await apiClient.patch(`/admin/orders/${orderId}/status`, {
      status,
      notes,
    })
    return response.data
  }

  /**
   * Update order tracking number (admin only)
   */
  async updateTrackingNumber(orderId: string, trackingNumber: string): Promise<Order> {
    const response = await apiClient.patch(`/admin/orders/${orderId}/tracking`, {
      trackingNumber,
    })
    return response.data
  }
}

// Export singleton instance
export const ordersService = new OrdersService()
