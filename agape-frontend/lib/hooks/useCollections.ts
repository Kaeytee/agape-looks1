import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
	getCollections,
	getCollectionBySlug,
	createCollection,
	updateCollection,
	deleteCollection,
	deleteAllCollections,
	type Collection
} from "@/lib/api/collections"

export function useCollections() {
	return useQuery({
		queryKey: ["collections"],
		queryFn: getCollections,
	})
}

export function useCollection(slug: string) {
	return useQuery({
		queryKey: ["collections", slug],
		queryFn: () => getCollectionBySlug(slug),
		enabled: !!slug,
	})
}

export function useCreateCollection() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: createCollection,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["collections"] })
		},
	})
}

export function useUpdateCollection() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<Collection> }) =>
			updateCollection(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["collections"] })
		},
	})
}

export function useDeleteCollection() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deleteCollection,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["collections"] })
		},
	})
}

export function useDeleteAllCollections() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: deleteAllCollections,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["collections"] })
		},
	})
}
