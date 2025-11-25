/**
 * Wishlist Service
 * API calls for managing user wishlist
 * @module lib/services/wishlist.service
 */

import apiClient from '../api/client'
import { Product } from '../types'

/**
 * Wishlist response interface
 */
export interface WishlistResponse {
  items: Product[]
  count: number
}

/**
 * Wishlist Service
 * Handles all wishlist-related API operations
 */
export const wishlistService = {
  /**
   * Get user's wishlist
   */
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await apiClient.get('/wishlist')
    // Backend wraps response in { status, data: {...} }
    return response.data.data || response.data
  },

  /**
   * Add item to wishlist
   */
  addToWishlist: async (productId: string): Promise<void> => {
    await apiClient.post('/wishlist', { productId })
  },

  /**
   * Remove item from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`)
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: string): Promise<boolean> => {
    const response = await apiClient.get(`/wishlist/check/${productId}`)
    return response.data.isInWishlist
  },

  /**
   * Clear entire wishlist
   */
  clearWishlist: async (): Promise<void> => {
    await apiClient.delete('/wishlist')
  },
}
