
import apiClient from '@/lib/api/client'

export interface DashboardStats {
	orders: {
		total_orders: string | number
		delivered_orders: string | number
		total_revenue: string | number
		average_order_value: string | number
	}
	users: {
		total_users: string | number
	}
	products: {
		total_products: string | number
	}
	coupons: {
		total_coupons: string | number
		active_coupons: string | number
		total_redemptions: string | number
		total_discount_given: string | number
	}
}

export interface SalesTrend {
	period: string
	order_count: string | number
	revenue: string | number
}

export const adminService = {
	getDashboardStats: async (params?: { from?: string; to?: string }) => {
		const response = await apiClient.get<{ status: string; data: DashboardStats }>('/admin/dashboard/stats', { params })
		return response.data.data
	},

	getSalesTrends: async (params?: { period?: 'daily' | 'weekly' | 'monthly'; limit?: number }) => {
		const response = await apiClient.get<{ status: string; data: { trends: SalesTrend[] } }>('/admin/dashboard/trends', { params })
		return response.data.data.trends
	}
}
