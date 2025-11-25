/**
 * React Query hooks for orders
 * Provides data fetching and caching for order operations
 * @module lib/hooks/useOrders
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersService, CreateOrderData } from '../services/orders.service'
import { toast } from 'sonner'

/**
 * Hook to fetch user's orders with pagination
 */
export function useOrders(page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => ordersService.getOrders(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes - orders change frequently
    enabled: enabled && typeof window !== 'undefined' && !!localStorage.getItem('token'),
  })
}

/**
 * Hook to fetch single order by ID
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersService.getOrder(orderId),
    enabled: !!orderId && typeof window !== 'undefined' && !!localStorage.getItem('token'),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderData) => ordersService.createOrder(data),
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order')
    },
  })
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      ordersService.cancelOrder(orderId, reason),
    onSuccess: (data) => {
      // Update order in cache
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      toast.success('Order cancelled successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    },
  })
}

/**
 * Hook to track order by order number and email (public)
 */
export function useTrackOrder() {
  return useMutation({
    mutationFn: ({ orderNumber, email }: { orderNumber: string; email: string }) =>
      ordersService.trackOrder(orderNumber, email),
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Order not found')
    },
  })
}

/**
 * Hook to fetch all orders (admin only)
 */
export function useAllOrders(page: number = 1, limit: number = 20, status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', page, limit, status],
    queryFn: () => ordersService.getAllOrders(page, limit, status),
    staleTime: 1 * 60 * 1000, // 1 minute - admin data should be fresh
  })
}

/**
 * Hook to update order status (admin only)
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status, notes }: { orderId: string; status: string; notes?: string }) =>
      ordersService.updateOrderStatus(orderId, status, notes),
    onSuccess: (data) => {
      // Invalidate all orders queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      toast.success('Order status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order status')
    },
  })
}

/**
 * Hook to update tracking number (admin only)
 */
export function useUpdateTrackingNumber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, trackingNumber }: { orderId: string; trackingNumber: string }) =>
      ordersService.updateTrackingNumber(orderId, trackingNumber),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', data.id] })
      toast.success('Tracking number updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update tracking number')
    },
  })
}
