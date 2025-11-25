"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { type Collection } from "@/lib/api/collections"
import { useCreateCollection, useUpdateCollection } from "@/lib/hooks/useCollections"
import { toast } from "sonner"
import Image from "next/image"

const formSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters"),
	description: z.string().optional(),
	image: z.string().min(1, "Image is required"),
	featured: z.boolean().default(false),
})

interface CollectionFormProps {
	initialData?: Collection
}

export function CollectionForm({ initialData }: CollectionFormProps) {
	const router = useRouter()
	const createCollection = useCreateCollection()
	const updateCollection = useUpdateCollection()
	const [isUploading, setIsUploading] = React.useState(false)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: initialData?.name || "",
			slug: initialData?.slug || "",
			description: initialData?.description || "",
			image: initialData?.image || "",
			featured: initialData?.featured || false,
		},
	})

	// Auto-generate slug from name
	const watchName = form.watch("name")
	React.useEffect(() => {
		if (!initialData && watchName) {
			const slug = watchName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)+/g, "")
			form.setValue("slug", slug)
		}
	}, [watchName, initialData, form])

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			if (initialData) {
				await updateCollection.mutateAsync({
					id: initialData.id,
					data: values,
				})
				toast.success("Collection updated successfully")
			} else {
				await createCollection.mutateAsync(values)
				toast.success("Collection created successfully")
			}
			router.push("/admin/collections")
		} catch (error) {
			toast.error(initialData ? "Failed to update collection" : "Failed to create collection")
		}
	}

	// Mock image upload for now - in real app would upload to Cloudinary/S3
	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setIsUploading(true)
			// Simulate upload delay
			setTimeout(() => {
				// For demo, just use a placeholder or object URL if we could, 
				// but since we need a string URL for the DB, we'll use a placeholder or the file name
				// In a real app, you'd upload to a server and get a URL back.
				// For now, let's just use a placeholder image URL to simulate success
				form.setValue("image", "/placeholder.svg?height=400&width=400")
				setIsUploading(false)
				toast.success("Image uploaded (simulated)")
			}, 1000)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
				<FormField
					control={form.control}
					name="name"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input placeholder="Collection Name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="slug"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Slug</FormLabel>
							<FormControl>
								<Input placeholder="collection-slug" {...field} />
							</FormControl>
							<FormDescription>
								URL-friendly version of the name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea placeholder="Collection description..." {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="image"
					render={({ field }: { field: any }) => (
						<FormItem>
							<FormLabel>Image</FormLabel>
							<FormControl>
								<div className="flex flex-col gap-4">
									<div className="flex items-center gap-4">
										<Input
											placeholder="Image URL"
											{...field}
											onChange={(e) => field.onChange(e.target.value)}
										/>
										<div className="relative">
											<Input
												type="file"
												className="absolute inset-0 opacity-0 cursor-pointer"
												onChange={handleImageUpload}
												accept="image/*"
												disabled={isUploading}
											/>
											<Button type="button" variant="outline" disabled={isUploading}>
												{isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
												Upload
											</Button>
										</div>
									</div>

									{field.value && (
										<div className="relative w-40 h-40 rounded-lg overflow-hidden border border-border">
											<Image
												src={field.value}
												alt="Preview"
												fill
												className="object-cover"
											/>
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2 h-6 w-6"
												onClick={() => field.onChange("")}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									)}
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="featured"
					render={({ field }: { field: any }) => (
						<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
							<div className="space-y-0.5">
								<FormLabel className="text-base">Featured Collection</FormLabel>
								<FormDescription>
									Display this collection in the featured section.
								</FormDescription>
							</div>
							<FormControl>
								<Switch
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
						</FormItem>
					)}
				/>

				<div className="flex gap-4">
					<Button type="button" variant="outline" onClick={() => router.back()}>
						Cancel
					</Button>
					<Button type="submit" disabled={createCollection.isPending || updateCollection.isPending}>
						{(createCollection.isPending || updateCollection.isPending) && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{initialData ? "Update Collection" : "Create Collection"}
					</Button>
				</div>
			</form>
		</Form>
	)
}
