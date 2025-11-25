"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Edit, Trash2, MoreVertical, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { useCollections, useDeleteCollection } from "@/lib/hooks/useCollections"
import { type Collection } from "@/lib/api/collections"
import { toast } from "sonner"

export default function AdminCollectionsPage() {
	const { data: collections, isLoading } = useCollections()
	const deleteCollection = useDeleteCollection()
	const [searchQuery, setSearchQuery] = React.useState("")
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
	const [collectionToDelete, setCollectionToDelete] = React.useState<Collection | null>(null)

	const filteredCollections = collections?.filter((collection) =>
		collection.name.toLowerCase().includes(searchQuery.toLowerCase())
	) || []

	const handleDeleteClick = (collection: Collection) => {
		setCollectionToDelete(collection)
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (collectionToDelete) {
			try {
				await deleteCollection.mutateAsync(collectionToDelete.id)
				toast.success("Collection deleted successfully")
			} catch (error) {
				toast.error("Failed to delete collection")
			} finally {
				setDeleteDialogOpen(false)
				setCollectionToDelete(null)
			}
		}
	}

	return (
		<AdminRouteGuard>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/admin">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Link>
						</Button>
						<div>
							<h1 className="font-display text-3xl font-bold">Collections</h1>
							<p className="text-muted-foreground">Manage your product collections</p>
						</div>
					</div>
					<Button asChild className="gap-2">
						<Link href="/admin/collections/new">
							<Plus className="h-4 w-4" />
							Add Collection
						</Link>
					</Button>
				</div>

				{/* Search */}
				<div className="mb-6">
					<div className="relative max-w-md">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search collections..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9"
						/>
					</div>
				</div>

				{/* Collections Table */}
				<div className="bg-card border border-border rounded-(--radius-md) overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[80px]">Image</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Products</TableHead>
								<TableHead>Featured</TableHead>
								<TableHead className="w-[80px]"></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredCollections.map((collection) => (
								<TableRow key={collection.id}>
									<TableCell>
										<div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
											<Image
												src={collection.image || "/placeholder.svg?height=48&width=48"}
												alt={collection.name}
												fill
												className="object-cover"
												sizes="48px"
											/>
										</div>
									</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{collection.name}</p>
											<p className="text-sm text-muted-foreground line-clamp-1">{collection.description}</p>
										</div>
									</TableCell>
									<TableCell className="font-mono text-sm">{collection.slug}</TableCell>
									<TableCell>{collection.productCount}</TableCell>
									<TableCell>
										{collection.featured ? (
											<Badge variant="gold">Featured</Badge>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem asChild>
													<Link href={`/admin/collections/${collection.id}/edit`}>
														<Edit className="h-4 w-4 mr-2" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive"
													onClick={() => handleDeleteClick(collection)}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{filteredCollections.length === 0 && (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No collections found</p>
					</div>
				)}

				{/* Delete Confirmation Dialog */}
				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This will permanently delete the collection "{collectionToDelete?.name}".
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDeleteConfirm}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							>
								Delete Collection
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</AdminRouteGuard>
	)
}
