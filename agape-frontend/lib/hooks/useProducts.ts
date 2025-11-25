/**
 * React Query hooks for products
 * Provides data fetching and caching for product operations
 * @module lib/hooks/useProducts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsService, ProductFilters } from '../services/products.service'
import { toast } from 'sonner'

/**
 * Hook to fetch products with filters
 */
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch single product by ID or slug
 */
export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: () => productsService.getProduct(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch featured products
 */
export function useFeaturedProducts(limit: number = 4) {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productsService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to search products
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productsService.searchProducts(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(categorySlug: string, filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug, filters],
    queryFn: () => productsService.getProductsByCategory(categorySlug, filters),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create product (admin)
 */
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product')
    },
  })
}

/**
 * Hook to update product (admin)
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product')
    },
  })
}

/**
 * Hook to delete product (admin)
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    },
  })
}
