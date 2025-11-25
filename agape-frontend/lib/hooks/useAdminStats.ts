
import { useQuery } from '@tanstack/react-query'
import { adminService, DashboardStats, SalesTrend } from '@/lib/services/admin.service'

export function useDashboardStats(params?: { from?: string; to?: string }) {
	return useQuery({
		queryKey: ['admin', 'dashboard', 'stats', params],
		queryFn: () => adminService.getDashboardStats(params),
	})
}

export function useSalesTrends(params?: { period?: 'daily' | 'weekly' | 'monthly'; limit?: number }) {
	return useQuery({
		queryKey: ['admin', 'dashboard', 'trends', params],
		queryFn: () => adminService.getSalesTrends(params),
	})
}
