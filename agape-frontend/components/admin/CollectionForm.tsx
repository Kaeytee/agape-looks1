"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { FileUpload } from "@/components/ui/file-upload"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { useCreateCollection, useUpdateCollection } from "@/lib/hooks/useCollections"
import { useQueryClient } from "@tanstack/react-query"

// --- Types ---
interface CollectionFormData {
	name: string
	slug: string
	description: string
	image: string | null
	featured: boolean
}

interface CollectionFormProps {
	mode: "create" | "edit"
	initialData?: any
	collectionId?: string
}

const loadingStates = [
	{ text: "Validating collection details" },
	{ text: "Optimizing collection image" },
	{ text: "Uploading to secure cloud" },
	{ text: "Saving collection information" },
	{ text: "Updating store navigation" },
	{ text: "Finalizing collection" },
]

// --- Preview Component ---
function CollectionPreview({ data }: { data: CollectionFormData }) {
	const mainImage = data.image || "/placeholder.svg?height=600&width=400"

	return (
		<div className="sticky top-8 space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium text-muted-foreground">Live Preview</h3>
				<Badge variant="outline" className="text-xs">Store View</Badge>
			</div>

			<div className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
				<div className="relative aspect-[16/9] bg-muted/30 overflow-hidden">
					<Image
						src={mainImage}
						alt={data.name || "Collection Preview"}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					<div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
					<div className="absolute bottom-0 left-0 p-6 text-white">
						<h3 className="font-display text-2xl font-bold leading-tight mb-2">
							{data.name || "Collection Name"}
						</h3>
						{data.featured && (
							<Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-none">
								Featured Collection
							</Badge>
						)}
					</div>
				</div>

				<div className="p-5 space-y-3">
					<p className="text-sm text-muted-foreground line-clamp-3">
						{data.description || "Collection description will appear here."}
					</p>
				</div>
			</div>
		</div>
	)
}

export function CollectionForm({ mode, initialData, collectionId }: CollectionFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [isLoading, setIsLoading] = React.useState(false)
	const createCollection = useCreateCollection()
	const updateCollection = useUpdateCollection()
	const queryClient = useQueryClient()

	const [formData, setFormData] = React.useState<CollectionFormData>(() => {
		if (mode === "edit" && initialData) {
			return {
				name: initialData.name || "",
				slug: initialData.slug || "",
				description: initialData.description || "",
				image: initialData.image || null,
				featured: initialData.featured || false,
			}
		}
		return {
			name: "",
			slug: "",
			description: "",
			image: null,
			featured: false,
		}
	})

	const [isSlugEdited, setIsSlugEdited] = React.useState(mode === "edit")

	// Auto-generate Slug from name (only in create mode)
	React.useEffect(() => {
		if (mode === "create" && formData.name) {
			if (!isSlugEdited) {
				const generatedSlug = formData.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "")

				setFormData(prev => ({ ...prev, slug: generatedSlug }))
			}
		}
	}, [formData.name, isSlugEdited, mode])

	const [imageFile, setImageFile] = React.useState<File | null>(null)

	const handleFileUpload = (files: File[]) => {
		if (files.length > 0) {
			const file = files[0]
			const imageUrl = URL.createObjectURL(file)
			setFormData(prev => ({ ...prev, image: imageUrl }))
			setImageFile(file)
			toast({
				title: "Image Selected",
				description: `Selected ${file.name}`
			})
		}
	}

	const convertFileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = error => reject(error)
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			let uploadedImageUrl = formData.image

			// Upload Image if it's a new file
			if (imageFile) {
				const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
				const base64File = await convertFileToBase64(imageFile)
				const uploadRes = await fetch('/api/v1/media/upload', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ file: base64File })
				})

				if (!uploadRes.ok) {
					const errorData = await uploadRes.json().catch(() => ({}))
					console.error("Upload failed:", errorData)
					throw new Error(errorData.message || 'Failed to upload image')
				}

				const uploadData = await uploadRes.json()
				uploadedImageUrl = uploadData.data.url
			}

			const collectionPayload: any = {
				name: formData.name,
				slug: formData.slug,
				description: formData.description,
				image: uploadedImageUrl,
				featured: formData.featured,
			}

			if (mode === "create") {
				await createCollection.mutateAsync(collectionPayload)
			} else {
				if (!collectionId) throw new Error("Collection ID is required for updates")
				await updateCollection.mutateAsync({ id: collectionId, data: collectionPayload })
			}

			// Ensure cache is invalidated before redirecting
			await queryClient.invalidateQueries({ queryKey: ['collections'] })
			if (collectionId) {
				await queryClient.invalidateQueries({ queryKey: ['collections', formData.slug] })
			}

			router.push("/admin/collections")

		} catch (error: any) {
			console.error(`Error ${mode}ing collection:`, error)
			if (!createCollection.isError && !updateCollection.isError) {
				toast({
					title: "Error",
					description: error.message || "Something went wrong. Please try again.",
					variant: "destructive",
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	const isEditMode = mode === "edit"

	return (
		<>
			<MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={1000} />
			<div className="flex flex-col gap-8 pb-20">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild className="rounded-full">
							<Link href="/admin/collections">
								<ArrowLeft className="h-5 w-5" />
							</Link>
						</Button>
						<div>
							<h1 className="font-display text-3xl font-bold tracking-tight">
								{isEditMode ? "Edit Collection" : "New Collection"}
							</h1>
							<p className="text-muted-foreground">
								{isEditMode ? "Update collection details" : "Create a new product collection"}
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/admin/collections">Discard</Link>
						</Button>
						<Button onClick={handleSubmit} disabled={isLoading} className="gap-2 min-w-[140px]">
							<Save className="h-4 w-4" />
							{isLoading ? "Saving..." : isEditMode ? "Update Collection" : "Save Collection"}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
					{/* Left Column: Form */}
					<div className="xl:col-span-8 space-y-8">
						{/* Collection Image */}
						<div className="grid grid-cols-1 gap-8">
							<Card className="overflow-hidden border-border/60 shadow-sm h-full">
								<CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
									<CardTitle className="flex items-center gap-2">
										<ImageIcon className="h-5 w-5 text-primary" />
										Collection Image
									</CardTitle>
									<CardDescription>
										Upload a high-quality image for this collection.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6 flex items-center justify-center">
									<div className="w-full">
										<FileUpload onChange={handleFileUpload} />
									</div>
								</CardContent>
							</Card>

							{/* Basic Information */}
							<Card className="border-border/60 shadow-sm h-full">
								<CardHeader className="pb-4">
									<CardTitle>Collection Details</CardTitle>
									<CardDescription>Basic information about the collection.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid gap-6">
										<div className="space-y-2">
											<Label htmlFor="name">Collection Name *</Label>
											<Input
												id="name"
												required
												value={formData.name}
												onChange={(e) => setFormData({ ...formData, name: e.target.value })}
												placeholder="e.g., Summer Essentials"
												className="text-lg font-medium"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="slug">Handle / Slug</Label>
											<div className="flex rounded-md shadow-sm">
												<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
													/collections/
												</span>
												<Input
													id="slug"
													value={formData.slug}
													onChange={(e) => {
														setFormData({ ...formData, slug: e.target.value })
														setIsSlugEdited(true)
													}}
													disabled={isEditMode}
													className="rounded-l-none font-mono text-sm"
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="description">Description</Label>
											<Textarea
												id="description"
												value={formData.description}
												onChange={(e) => setFormData({ ...formData, description: e.target.value })}
												placeholder="Describe this collection..."
												rows={4}
											/>
										</div>

										<div className="flex items-start space-x-3 pt-2">
											<Checkbox
												id="featured"
												checked={formData.featured}
												onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
											/>
											<div className="space-y-1 leading-none">
												<Label htmlFor="featured" className="cursor-pointer font-medium">
													Featured Collection
												</Label>
												<p className="text-xs text-muted-foreground">
													Display this collection in featured sections.
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Right Column: Live Preview */}
					<div className="xl:col-span-4">
						<CollectionPreview data={formData} />
					</div>
				</div>
			</div>
		</>
	)
}
