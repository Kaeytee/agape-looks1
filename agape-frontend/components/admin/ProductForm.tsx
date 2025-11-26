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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useCollections } from "@/lib/hooks/useCollections"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { FileUpload } from "@/components/ui/file-upload"
import { MultiStepLoader } from "@/components/ui/multi-step-loader"
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/useProducts"
import { useQueryClient } from "@tanstack/react-query"

// --- Types ---
interface ProductFormData {
	title: string
	subtitle: string
	slug: string
	sku: string
	price: string
	currency: string
	shortDescription: string
	fullStory: string
	collectionId: string
	width: string
	height: string
	depth: string
	unit: string
	stock: string
	materials: string
	tags: string[]
	isFeatured: boolean
	isLimited: boolean
	image: string | null
	hoverImage: string | null
	color: string
	colors: string[]
	fabricType: string
}

// ... (keep existing imports and props)



interface ProductFormProps {
	mode: "create" | "edit"
	initialData?: any
	productId?: string
}

const loadingStates = [
	{ text: "Validating product details" },
	{ text: "Optimizing product image" },
	{ text: "Uploading to secure cloud" },
	{ text: "Generating product SKU" },
	{ text: "Saving product information" },
	{ text: "Updating inventory records" },
	{ text: "Syncing with search index" },
	{ text: "Finalizing product creation" },
]

// --- Preview Component ---
function ProductPreview({ data, collectionName }: { data: ProductFormData; collectionName?: string }) {
	const mainImage = data.image || "/placeholder.svg?height=600&width=400"
	const hoverImage = data.hoverImage || mainImage

	return (
		<div className="sticky top-8 space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium text-muted-foreground">Live Preview</h3>
				<Badge variant="outline" className="text-xs">Store View</Badge>
			</div>

			<div className="group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300">
				<div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
					<Image
						src={mainImage}
						alt={data.title || "Product Preview"}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-0"
					/>
					<Image
						src={hoverImage}
						alt={(data.title || "Product Preview") + " Hover"}
						fill
						className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-0 group-hover:opacity-100 absolute inset-0"
					/>
					<div className="absolute top-3 left-3 flex flex-col gap-2">
						{data.isFeatured && (
							<Badge className="bg-primary text-primary-foreground backdrop-blur-md shadow-sm">
								Featured
							</Badge>
						)}
						{data.isLimited && (
							<Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm">
								Limited Edition
							</Badge>
						)}
					</div>
				</div>

				<div className="p-5 space-y-3">
					<div className="space-y-1">
						{collectionName && (
							<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
								{collectionName}
							</p>
						)}
						<h3 className="font-display text-xl font-bold leading-tight text-foreground">
							{data.title || "Product Title"}
						</h3>
						{data.subtitle && (
							<p className="text-sm text-muted-foreground font-medium">
								{data.subtitle}
							</p>
						)}
					</div>

					<p className="text-sm text-muted-foreground line-clamp-2">
						{data.shortDescription || "A brief description of the product will appear here."}
					</p>

					<div className="pt-2 flex items-center justify-between border-t border-border/50 mt-4">
						<div className="flex flex-col">
							<span className="text-xs text-muted-foreground">Price</span>
							<span className="font-display text-lg font-bold">
								{data.currency} {data.price || "0.00"}
							</span>
						</div>

						{(data.width || data.height) && (
							<div className="flex flex-col items-end">
								<span className="text-xs text-muted-foreground">Dimensions</span>
								<span className="text-sm font-medium">
									{data.width || "-"}{data.unit} × {data.height || "-"}{data.unit}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="bg-card rounded-lg border border-border p-4 flex gap-4 items-center">
				<div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
					<Image
						src={mainImage}
						alt="Mini preview"
						fill
						className="object-cover"
					/>
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium truncate">{data.title || "Product Title"}</h4>
					<p className="text-sm text-muted-foreground truncate">
						{data.sku || "SKU-PENDING"}
					</p>
				</div>
				<div className="font-bold">
					{data.currency} {data.price || "0.00"}
				</div>
			</div>
		</div>
	)
}

export function ProductForm({ mode, initialData, productId }: ProductFormProps) {
	const router = useRouter()
	const { toast } = useToast()
	const [isLoading, setIsLoading] = React.useState(false)
	const { data: collections } = useCollections()
	const createProduct = useCreateProduct()
	const updateProduct = useUpdateProduct()
	const queryClient = useQueryClient()

	const [formData, setFormData] = React.useState<ProductFormData>(() => {
		if (mode === "edit" && initialData) {
			return {
				title: initialData.title || "",
				subtitle: initialData.metadata?.subtitle || "",
				slug: initialData.slug || "",
				sku: initialData.sku || "",
				price: initialData.price?.toString() || "",
				currency: initialData.currency || "GHS",
				shortDescription: initialData.metadata?.short_description || "",
				fullStory: initialData.description || "",
				collectionId: initialData.collection_id || "",
				width: initialData.dimensions?.width?.toString() || "",
				height: initialData.dimensions?.height?.toString() || "",
				depth: initialData.dimensions?.depth?.toString() || "",
				unit: initialData.dimensions?.unit || "cm",
				stock: initialData.metadata?.stock?.toString() || "",
				materials: initialData.metadata?.materials || "",
				tags: initialData.tags || [],
				isFeatured: initialData.metadata?.is_featured || false,
				isLimited: initialData.metadata?.is_limited || false,
				image: initialData.images?.[0]?.url || null,
				hoverImage: initialData.images?.[1]?.url || null,
				color: initialData.metadata?.color || "",
				colors: initialData.metadata?.colors || (initialData.metadata?.color ? [initialData.metadata.color] : []),
				fabricType: initialData.metadata?.fabric_type || ""
			}
		}
		return {
			title: "",
			subtitle: "",
			slug: "",
			sku: "",
			price: "",
			currency: "GHS",
			shortDescription: "",
			fullStory: "",
			collectionId: "",
			width: "",
			height: "",
			depth: "",
			unit: "cm",
			stock: "",
			materials: "",
			tags: [],
			isFeatured: false,
			isLimited: false,
			image: null,
			hoverImage: null,
			color: "",
			colors: [],
			fabricType: ""
		}
	})

	const [isSlugEdited, setIsSlugEdited] = React.useState(mode === "edit")
	const [isSkuEdited, setIsSkuEdited] = React.useState(mode === "edit")

	// Auto-generate SKU and Slug from title (only in create mode)
	React.useEffect(() => {
		if (mode === "create" && formData.title) {
			if (!isSkuEdited) {
				const generatedSku = formData.title
					.toUpperCase()
					.replace(/[^A-Z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "")
					.substring(0, 20)

				setFormData(prev => ({ ...prev, sku: generatedSku }))
			}

			if (!isSlugEdited) {
				const randomSuffix = Math.random().toString(36).substring(2, 6)
				const generatedSlug = formData.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/^-+|-+$/g, "") +
					`-${randomSuffix}`

				setFormData(prev => ({ ...prev, slug: generatedSlug }))
			}
		}
	}, [formData.title, isSlugEdited, isSkuEdited, mode])

	const [imageFile, setImageFile] = React.useState<File | null>(null)
	const [hoverImageFile, setHoverImageFile] = React.useState<File | null>(null)

	const handleFileUpload = (files: File[]) => {
		if (files.length > 0) {
			const file = files[0]
			const imageUrl = URL.createObjectURL(file)
			setFormData(prev => ({ ...prev, image: imageUrl }))
			setImageFile(file)
			toast({
				title: "Main Image Selected",
				description: `Selected ${file.name}`
			})
		}
	}

	const handleHoverFileUpload = (files: File[]) => {
		if (files.length > 0) {
			const file = files[0]
			const imageUrl = URL.createObjectURL(file)
			setFormData(prev => ({ ...prev, hoverImage: imageUrl }))
			setHoverImageFile(file)
			toast({
				title: "Hover Image Selected",
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

	const toTitleCase = (str: string) => {
		return str.replace(/\w\S*/g, (txt) => {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
		})
	}

	const toSentenceCase = (str: string) => {
		if (!str) return ""
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)

		try {
			// Prepare dimensions
			const width = formData.width ? parseFloat(formData.width) : undefined
			const height = formData.height ? parseFloat(formData.height) : undefined
			const depth = formData.depth ? parseFloat(formData.depth) : undefined

			const dimensions = (width || height || depth) ? {
				width,
				height,
				depth,
				unit: formData.unit
			} : undefined

			const productPayload: any = {
				title: toTitleCase(formData.title),
				description: toSentenceCase(formData.fullStory),
				price: parseFloat(formData.price),
				currency: formData.currency,
				dimensions: dimensions,
				metadata: {
					subtitle: toSentenceCase(formData.subtitle),
					short_description: toSentenceCase(formData.shortDescription),
					stock: parseInt(formData.stock || '0'),
					materials: formData.materials,
					is_featured: formData.isFeatured,
					is_limited: formData.isLimited,
					color: formData.colors[0] || "",
					colors: formData.colors,
					fabric_type: formData.fabricType,
				},
			}

			// Only include sku and slug in create mode
			if (mode === "create") {
				productPayload.sku = formData.sku
				productPayload.slug = formData.slug
			}

			// Only add collectionId if selected
			if (formData.collectionId) {
				productPayload.collectionId = formData.collectionId
			}

			// Handle Images
			const finalImages = []

			// 1. Process Main Image
			if (imageFile) {
				// Upload new main image
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

				if (!uploadRes.ok) throw new Error('Failed to upload main image')
				const uploadData = await uploadRes.json()
				finalImages.push({
					url: uploadData.data.url,
					publicId: uploadData.data.publicId,
					altText: toTitleCase(formData.title),
					position: 0
				})
			} else if (formData.image) {
				// Keep existing main image
				// Try to find it in initialData to get publicId
				const existing = initialData?.images?.find((img: any) => img.url === formData.image)
				if (existing) {
					finalImages.push({
						url: existing.url,
						publicId: existing.public_id || existing.publicId,
						altText: existing.alt_text || existing.altText || toTitleCase(formData.title),
						position: 0
					})
				}
			}

			// 2. Process Hover Image
			if (hoverImageFile) {
				// Upload new hover image
				const token = localStorage.getItem('token') || localStorage.getItem('accessToken')
				const base64File = await convertFileToBase64(hoverImageFile)
				const uploadRes = await fetch('/api/v1/media/upload', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ file: base64File })
				})

				if (!uploadRes.ok) throw new Error('Failed to upload hover image')
				const uploadData = await uploadRes.json()
				finalImages.push({
					url: uploadData.data.url,
					publicId: uploadData.data.publicId,
					altText: `${toTitleCase(formData.title)} - Closeup`,
					position: 1
				})
			} else if (formData.hoverImage) {
				// Keep existing hover image
				const existing = initialData?.images?.find((img: any) => img.url === formData.hoverImage)
				if (existing) {
					finalImages.push({
						url: existing.url,
						publicId: existing.public_id || existing.publicId,
						altText: existing.alt_text || existing.altText || `${toTitleCase(formData.title)} - Closeup`,
						position: 1
					})
				}
			}

			productPayload.images = finalImages

			if (mode === "create") {
				await createProduct.mutateAsync(productPayload)
			} else {
				if (!productId) throw new Error("Product ID is required for updates")
				await updateProduct.mutateAsync({ id: productId, data: productPayload })
			}

			// Invalidate cache without waiting
			queryClient.invalidateQueries({ queryKey: ['products'] })
			if (productId) {
				queryClient.invalidateQueries({ queryKey: ['product', productId] })
			}

			// Success handling is done in the hooks, but we redirect here
			router.push("/admin/products")

		} catch (error: any) {
			console.error(`Error ${mode}ing product:`, error)
			// Toast is handled by hooks for mutation errors, but we catch other errors here
			if (!createProduct.isError && !updateProduct.isError) {
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

	const selectedCollection = collections?.find(c => c.id === formData.collectionId)
	const isEditMode = mode === "edit"

	return (
		<>
			<MultiStepLoader loadingStates={loadingStates} loading={isLoading} duration={1000} />
			<div className="flex flex-col gap-8 pb-20">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" asChild className="rounded-full">
							<Link href="/admin/products">
								<ArrowLeft className="h-5 w-5" />
							</Link>
						</Button>
						<div>
							<h1 className="font-display text-3xl font-bold tracking-tight">
								{isEditMode ? "Edit Product" : "Add New Product"}
							</h1>
							<p className="text-muted-foreground">
								{isEditMode ? "Update product details" : "Create a new product in your catalog"}
							</p>
						</div>
					</div>
					<div className="flex gap-3">
						<Button variant="outline" asChild>
							<Link href="/admin/products">Discard</Link>
						</Button>
						<Button onClick={handleSubmit} disabled={isLoading} className="gap-2 min-w-[140px]">
							<Save className="h-4 w-4" />
							{isLoading ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
						</Button>
					</div>
				</div>

				<div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
					{/* Left Column: Form */}
					<div className="xl:col-span-8 space-y-8">
						{/* Product Image */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<Card className="overflow-hidden border-border/60 shadow-sm h-full">
								<CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
									<CardTitle className="flex items-center gap-2">
										<ImageIcon className="h-5 w-5 text-primary" />
										Product Images
									</CardTitle>
									<CardDescription>
										Upload the main image and a closeup/hover image.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6 space-y-6">
									<div className="space-y-3">
										<Label>Main Image</Label>
										<div className="w-full">
											<FileUpload onChange={handleFileUpload} />
										</div>
										{formData.image && (
											<p className="text-xs text-muted-foreground">
												Current: {formData.image.split('/').pop()}
											</p>
										)}
									</div>

									<Separator />

									<div className="space-y-3">
										<Label>Closeup / Hover Image</Label>
										<div className="w-full">
											<FileUpload onChange={handleHoverFileUpload} />
										</div>
										{formData.hoverImage && (
											<p className="text-xs text-muted-foreground">
												Current: {formData.hoverImage.split('/').pop()}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Basic Information */}
							<Card className="border-border/60 shadow-sm h-full">
								<CardHeader className="pb-4">
									<CardTitle>Basic Information</CardTitle>
									<CardDescription>Essential details about the product.</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									<div className="grid gap-6">
										<div className="space-y-2">
											<Label htmlFor="title">Product Title *</Label>
											<Input
												id="title"
												required
												value={formData.title}
												onChange={(e) => setFormData({ ...formData, title: e.target.value })}
												placeholder="e.g., Royal Asante Lace"
												className="text-lg font-medium"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="subtitle">Subtitle</Label>
											<Input
												id="subtitle"
												value={formData.subtitle}
												onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
												placeholder="e.g., Premium Handwoven Kente"
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="slug">Handle / Slug</Label>
											<div className="flex rounded-md shadow-sm">
												<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
													/products/
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

										<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="collection">Collection (Optional)</Label>
												<Select
													value={formData.collectionId}
													onValueChange={(value) => setFormData({ ...formData, collectionId: value })}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select Collection" />
													</SelectTrigger>
													<SelectContent>
														{collections?.map((collection) => (
															<SelectItem key={collection.id} value={collection.id}>
																{collection.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<Label htmlFor="price">Price *</Label>
												<div className="flex gap-2">
													<Select
														value={formData.currency}
														onValueChange={(value) => setFormData({ ...formData, currency: value })}
													>
														<SelectTrigger className="w-24 bg-muted/50">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="GHS">GHS</SelectItem>
															<SelectItem value="USD">USD</SelectItem>
														</SelectContent>
													</Select>
													<Input
														id="price"
														type="number"
														step="0.01"
														required
														value={formData.price}
														onChange={(e) => setFormData({ ...formData, price: e.target.value })}
														placeholder="0.00"
														className="flex-1 font-mono"
													/>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Product Descriptions */}
						<Card className="border-border/60 shadow-sm">
							<CardHeader className="pb-4">
								<CardTitle>Description & Story</CardTitle>
								<CardDescription>Tell the story of this product.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="shortDescription">
										Brief Card Description
										<span className="ml-2 text-xs text-muted-foreground font-normal">(Appears on product cards)</span>
									</Label>
									<Textarea
										id="shortDescription"
										value={formData.shortDescription}
										onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
										placeholder="A short, catchy description..."
										rows={2}
										className="resize-none"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="fullStory">
										Full Product Story
										<span className="ml-2 text-xs text-muted-foreground font-normal">(Detailed page content)</span>
									</Label>
									<Textarea
										id="fullStory"
										value={formData.fullStory}
										onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
										placeholder="Describe the cultural significance, origin, and details..."
										rows={8}
										className="font-serif"
									/>
								</div>
							</CardContent>
						</Card>

						{/* Dimensions */}
						<Card className="border-border/60 shadow-sm">
							<CardHeader className="pb-4">
								<CardTitle>Dimensions</CardTitle>
								<CardDescription>Physical measurements of the product.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-4 items-end">
									<div className="space-y-2 w-full sm:w-32">
										<Label htmlFor="width">Width</Label>
										<div className="relative">
											<Input
												id="width"
												type="number"
												value={formData.width}
												onChange={(e) => setFormData({ ...formData, width: e.target.value })}
												placeholder="0"
											/>
											<span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{formData.unit}</span>
										</div>
									</div>
									<div className="hidden sm:flex items-center pb-3 text-muted-foreground">×</div>
									<div className="space-y-2 w-full sm:w-32">
										<Label htmlFor="height">Height</Label>
										<div className="relative">
											<Input
												id="height"
												type="number"
												value={formData.height}
												onChange={(e) => setFormData({ ...formData, height: e.target.value })}
												placeholder="0"
											/>
											<span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{formData.unit}</span>
										</div>
									</div>
									<div className="hidden sm:flex items-center pb-3 text-muted-foreground">×</div>
									<div className="space-y-2 w-full sm:w-32">
										<Label htmlFor="depth">Depth/Length</Label>
										<div className="relative">
											<Input
												id="depth"
												type="number"
												value={formData.depth}
												onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
												placeholder="0"
											/>
											<span className="absolute right-3 top-2.5 text-xs text-muted-foreground">{formData.unit}</span>
										</div>
									</div>

									<div className="space-y-2 w-full sm:w-24 sm:ml-4">
										<Label htmlFor="unit">Unit</Label>
										<Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="cm">cm</SelectItem>
												<SelectItem value="in">in</SelectItem>
												<SelectItem value="mm">mm</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Additional Details */}
						<Card className="border-border/60 shadow-sm">
							<CardHeader className="pb-4 cursor-pointer">
								<CardTitle className="text-base">Additional Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="sku">SKU / Product Code</Label>
										<Input
											id="sku"
											value={formData.sku}
											onChange={(e) => {
												setFormData({ ...formData, sku: e.target.value })
												setIsSkuEdited(true)
											}}
											disabled={isEditMode}
											placeholder="Auto-generated"
											className="font-mono"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="stock">Stock Quantity</Label>
										<Input
											id="stock"
											type="number"
											value={formData.stock}
											onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
											placeholder="0"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label>Colors</Label>
										<div className="flex flex-wrap gap-3">
											{[
												{ value: 'Gold', hex: '#C19A36' },
												{ value: 'Blue', hex: '#1E40AF' },
												{ value: 'Black', hex: '#1A1A1A' },
												{ value: 'Multicolor', hex: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
												{ value: 'Other', hex: '#e5e7eb' }
											].map((option) => {
												const isSelected = formData.colors.includes(option.value)
												return (
													<button
														key={option.value}
														type="button"
														onClick={() => {
															const newColors = isSelected
																? formData.colors.filter(c => c !== option.value)
																: [...formData.colors, option.value]
															setFormData({ ...formData, colors: newColors, color: newColors[0] || "" })
														}}
														className={`
																relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110
																${isSelected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border'}
															`}
														style={{ background: option.hex }}
														title={option.value}
													>
														{isSelected && (
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
																	<div className="w-2 h-2 bg-primary rounded-full" />
																</div>
															</div>
														)}
														<span className="sr-only">{option.value}</span>
													</button>
												)
											})}
										</div>
										{formData.colors.length > 0 && (
											<p className="text-xs text-muted-foreground mt-1">
												Selected: <span className="font-medium text-foreground">{formData.colors.join(", ")}</span>
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="fabricType">Fabric Type</Label>
										<Select
											value={formData.fabricType}
											onValueChange={(value) => setFormData({ ...formData, fabricType: value })}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select Fabric Type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Beaded Lush Lace">Beaded Lush Lace</SelectItem>
												<SelectItem value="Lush 3D Lace">Lush 3D Lace</SelectItem>
												<SelectItem value="Crystallized Luxury Lace">Crystallized Luxury Lace</SelectItem>
												<SelectItem value="Ivory Beaded Fringe Lace">Ivory Beaded Fringe Lace</SelectItem>
												<SelectItem value="Korean Beaded Lace">Korean Beaded Lace</SelectItem>
												<SelectItem value="Beaded Lace">Beaded Lace</SelectItem>
												<SelectItem value="Two Toned Lace">Two Toned Lace</SelectItem>
												<SelectItem value="Brocade">Brocade</SelectItem>
												<SelectItem value="Metallic Brocade">Metallic Brocade</SelectItem>
												<SelectItem value="Brads and Pearls">Brads and Pearls</SelectItem>
												<SelectItem value="Other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="materials">Materials</Label>
									<Input
										id="materials"
										value={formData.materials}
										onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
										placeholder="e.g., 100% Cotton, Silk Thread"
									/>
								</div>

								<Separator />

								<div className="flex flex-col sm:flex-row gap-8">
									<div className="flex items-start space-x-3">
										<Checkbox
											id="isFeatured"
											checked={formData.isFeatured}
											onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
										/>
										<div className="space-y-1 leading-none">
											<Label htmlFor="isFeatured" className="cursor-pointer font-medium">
												Featured Product
											</Label>
											<p className="text-xs text-muted-foreground">
												Display this product in featured sections.
											</p>
										</div>
									</div>

									<div className="flex items-start space-x-3">
										<Checkbox
											id="isLimited"
											checked={formData.isLimited}
											onCheckedChange={(checked) => setFormData({ ...formData, isLimited: checked as boolean })}
										/>
										<div className="space-y-1 leading-none">
											<Label htmlFor="isLimited" className="cursor-pointer font-medium">
												Limited Edition
											</Label>
											<p className="text-xs text-muted-foreground">
												Mark as limited stock or exclusive item.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column: Live Preview */}
					<div className="xl:col-span-4">
						<ProductPreview
							data={{
								...formData,
								title: toTitleCase(formData.title),
								subtitle: toSentenceCase(formData.subtitle),
								shortDescription: toSentenceCase(formData.shortDescription),
								fullStory: toSentenceCase(formData.fullStory),
							}}
							collectionName={selectedCollection?.name}
						/>
					</div>
				</div>
			</div>
		</>
	)
}
