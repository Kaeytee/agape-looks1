/**
 * Products Service
 * Handles product fetching, searching, and CRUD operations
 * @module lib/services/products
 */

import apiClient from '../api/client'
import { Product } from '../types'

// Product filter interface
export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  tags?: string[]
  inStock?: boolean
  page?: number
  limit?: number
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'relevance'
  featured?: boolean
}

// Paginated products response
export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
  limit: number
}

/**
 * Products Service Class
 * Provides methods for product operations
 */
class ProductsService {
  /**
   * Get all products with optional filters and pagination
   */
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    // Map frontend sort values to backend sortBy and sortOrder
    const params: any = { ...filters }

    // Remove 'sort' and map to backend parameters
    if (params.sort) {
      const sortValue = params.sort
      delete params.sort

      // Map frontend sort values to backend sortBy/sortOrder
      switch (sortValue) {
        case 'newest':
          params.sortBy = 'created_at'
          params.sortOrder = 'desc'
          break
        case 'price-asc':
          params.sortBy = 'price'
          params.sortOrder = 'asc'
          break
        case 'price-desc':
          params.sortBy = 'price'
          params.sortOrder = 'desc'
          break
        case 'popular':
        case 'relevance':
        default:
          params.sortBy = 'created_at'
          params.sortOrder = 'desc'
          break
      }
    }

    // Map frontend 'featured' to backend 'isFeatured'
    if (params.featured !== undefined) {
      params.isFeatured = params.featured
      delete params.featured
    }

    console.log('Fetching products with params:', params)

    try {
      const response = await apiClient.get('/products', { params })
      console.log('Products response:', response.data)

      // The API returns { status: 'success', data: { products: [...] } }
      // We need to map this to the ProductsResponse interface
      const products = response.data?.data?.products || []

      return {
        products,
        total: products.length, // Backend doesn't return count yet
        page: params.page || 1,
        totalPages: 1, // Backend doesn't return total pages yet
        limit: params.limit || 20
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  /**
   * Get single product by ID or slug
   */
  async getProduct(idOrSlug: string): Promise<Product> {
    const response = await apiClient.get(`/products/${idOrSlug}`)
    // API wraps product under data.product
    return response.data?.data?.product || response.data
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const response = await apiClient.get('/products/search', {
      params: { q: query, limit },
    })
    // API returns { status, data: { products } }
    return response.data?.data?.products || []
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const response = await apiClient.get('/products', {
      params: { isFeatured: true, limit },
    })
    return response.data?.data?.products || []
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categorySlug: string, filters: ProductFilters = {}): Promise<ProductsResponse> {
    const response = await apiClient.get('/products', {
      params: { category: categorySlug, ...filters },
    })
    const products = response.data?.data?.products || []
    return {
      products,
      total: products.length,
      page: filters.page || 1,
      totalPages: 1,
      limit: filters.limit || 20,
    }
  }

  /**
   * Get related products for a specific product
   */
  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const response = await apiClient.get(`/products/${productId}/related`, {
      params: { limit },
    })
    return response.data
  }

  // ========== ADMIN METHODS ==========

  /**
   * Create new product (Admin only)
   */
  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await apiClient.post('/products', data)
    return response.data
  }

  /**
   * Update existing product (Admin only)
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.patch(`/products/${id}`, data)
    return response.data
  }

  /**
   * Delete product (Admin only)
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  }
}

// Export singleton instance
export const productsService = new ProductsService()
