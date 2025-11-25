"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { CollectionForm } from "../collection-form"

export default function NewCollectionPage() {
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
						<h1 className="font-display text-3xl font-bold">New Collection</h1>
						<p className="text-muted-foreground">Create a new product collection</p>
					</div>
				</div>

				<div className="bg-card border border-border rounded-xl p-6">
					<CollectionForm />
				</div>
			</div>
		</AdminRouteGuard>
	)
}
