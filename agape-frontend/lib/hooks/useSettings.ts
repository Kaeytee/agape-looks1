import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api/client"
import { toast } from "sonner"

export interface Setting {
	value: any
	description: string
}

export interface SettingsMap {
	[key: string]: Setting
}

export function useSettings() {
	return useQuery<SettingsMap>({
		queryKey: ["settings"],
		queryFn: async () => {
			const response = await api.get("/settings")
			return response.data.data
		},
	})
}

export function useUpdateSetting() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ key, value }: { key: string; value: any }) => {
			const response = await api.put(`/settings/${key}`, { value })
			return response.data.data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings"] })
			toast.success("Setting updated successfully")
		},
		onError: () => {
			toast.error("Failed to update setting")
		},
	})
}
