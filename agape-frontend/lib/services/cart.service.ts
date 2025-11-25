/**
 * Cart Service
 * Handles shopping cart operations
 * @module lib/services/cart
 */

import apiClient from '../api/client'
import { CartItem } from '../types'

// Cart response interface
export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
}

/**
 * Cart Service Class
 * Provides methods for cart management
 */
class CartService {
  /**
   * Get current user's cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get('/cart')
    return response.data
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number, variantId?: string): Promise<Cart> {
    const response = await apiClient.post('/cart/items', {
      productId,
      quantity,
      variantId,
    })
    return response.data
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity })
    return response.data
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await apiClient.delete(`/cart/items/${itemId}`)
    return response.data
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete('/cart')
  }

  /**
   * Merge guest cart with user cart on login
   */
  async mergeGuestCart(guestCartId: string): Promise<Cart> {
    const response = await apiClient.post('/cart/merge', { guestCartId })
    return response.data
  }
}

// Export singleton instance
export const cartService = new CartService()
