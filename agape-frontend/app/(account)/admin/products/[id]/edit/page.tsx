"use client"

import { useParams } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { ProductForm } from "@/components/admin/ProductForm"
import { useProduct } from "@/lib/hooks/useProducts"
import { Loader2 } from "lucide-react"

export default function EditProductPage() {
	return (
		<AdminRouteGuard>
			<EditProductContent />
		</AdminRouteGuard>
	)
}

function EditProductContent() {
	const params = useParams()
	const productId = params.id as string
	const { data: product, isLoading, error } = useProduct(productId)

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
					<p className="text-muted-foreground">Loading product...</p>
				</div>
			</div>
		)
	}

	if (error || !product) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-4">
					<h2 className="text-2xl font-bold">Product Not Found</h2>
					<p className="text-muted-foreground">
						The product you're looking for doesn't exist or has been deleted.
					</p>
				</div>
			</div>
		)
	}

	return <ProductForm mode="edit" initialData={product} productId={productId} />
}
