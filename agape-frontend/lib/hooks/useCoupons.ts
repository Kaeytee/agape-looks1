import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api/client"

export interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed" | "free_shipping"
  amountOrPct: number
  minOrderAmount: number
  expiresAt: string | null
  usageLimit: number | null
  usedCount: number
  perUserLimit: number
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  totalUsage?: number
  totalDiscountGiven?: number
}

export interface CouponFilters {
  isActive?: boolean
  type?: string
  search?: string
  limit?: number
  offset?: number
}

export function useCoupons(filters?: CouponFilters) {
  return useQuery({
    queryKey: ["coupons", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive))
      if (filters?.type) params.append("type", filters.type)
      if (filters?.search) params.append("search", filters.search)
      if (filters?.limit) params.append("limit", String(filters.limit))
      if (filters?.offset) params.append("offset", String(filters.offset))

      const response = await api.get(`/coupons?${params.toString()}`)
      return response.data.data
    },
  })
}

export function useCouponById(id: string) {
  return useQuery({
    queryKey: ["coupon", id],
    queryFn: async () => {
      const response = await api.get(`/coupons/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCouponStats() {
  return useQuery({
    queryKey: ["coupon-stats"],
    queryFn: async () => {
      const response = await api.get("/coupons/stats")
      return response.data.data
    },
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Coupon>) => {
      const response = await api.post("/coupons", data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] })
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const response = await api.patch(`/coupons/${id}`, data)
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      queryClient.invalidateQueries({ queryKey: ["coupon", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/coupons/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] })
      queryClient.invalidateQueries({ queryKey: ["coupon-stats"] })
    },
  })
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: async ({
      code,
      cartSubtotal,
      shippingFee,
    }: {
      code: string
      cartSubtotal: number
      shippingFee: number
    }) => {
      const response = await api.post("/coupons/apply", {
        code,
        cartSubtotal,
        shippingFee,
      })
      return response.data.data
    },
  })
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: async ({ code, cartSubtotal }: { code: string; cartSubtotal: number }) => {
      const response = await api.post(`/coupons/validate/${code}`, {
        cartSubtotal,
      })
      return response.data.data
    },
  })
}
