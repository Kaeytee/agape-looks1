"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { CollectionForm } from "../../collection-form"
import { useCollections } from "@/lib/hooks/useCollections"

export default function EditCollectionPage({ params }: { params: { id: string } }) {
	const { data: collections, isLoading } = useCollections()

	// In a real app with individual fetch by ID, we'd use useCollection(id) or similar
	// But since we fetch all collections, we can find it here
	const collection = collections?.find(c => c.id === params.id)

	if (isLoading) {
		return (
			<AdminRouteGuard>
				<div className="flex items-center justify-center h-[50vh]">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</AdminRouteGuard>
		)
	}

	if (!collection) {
		return (
			<AdminRouteGuard>
				<div className="flex flex-col items-center justify-center h-[50vh] gap-4">
					<p className="text-muted-foreground">Collection not found</p>
					<Button asChild>
						<Link href="/admin/collections">Back to Collections</Link>
					</Button>
				</div>
			</AdminRouteGuard>
		)
	}

	return (
		<AdminRouteGuard>
			<div className="flex flex-col gap-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/admin/collections">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Link>
					</Button>
					<div>
						<h1 className="font-display text-3xl font-bold">Edit Collection</h1>
						<p className="text-muted-foreground">Update collection details</p>
					</div>
				</div>

				<div className="bg-card border border-border rounded-xl p-6">
					<CollectionForm initialData={collection} />
				</div>
			</div>
		</AdminRouteGuard>
	)
}
