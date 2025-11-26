import { AdminRouteGuard } from "@/components/admin-route-guard"
import { ProductForm } from "@/components/admin/ProductForm"

export default function NewProductPage() {
	return (
		<AdminRouteGuard>
			<ProductForm mode="create" />
		</AdminRouteGuard>
	)
}
