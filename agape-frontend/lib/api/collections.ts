import apiClient from "./client"

export interface Collection {
	id: string
	name: string
	slug: string
	description: string
	image: string
	productCount: number
	featured?: boolean
	color?: string
}

export async function getCollections(): Promise<Collection[]> {
	const response = await apiClient.get<{ data: Collection[] }>("/collections")
	return response.data.data
}

export async function getCollectionBySlug(slug: string): Promise<Collection> {
	const response = await apiClient.get<{ data: Collection }>(`/collections/${slug}`)
	return response.data.data
}

export async function createCollection(data: Partial<Collection>): Promise<Collection> {
	const response = await apiClient.post<{ data: Collection }>("/collections", data)
	return response.data.data
}

export async function updateCollection(id: string, data: Partial<Collection>): Promise<Collection> {
	const response = await apiClient.put<{ data: Collection }>(`/collections/${id}`, data)
	return response.data.data
}

export async function deleteCollection(id: string): Promise<void> {
	await apiClient.delete(`/collections/${id}`)
}
