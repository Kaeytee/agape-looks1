import { AdminRouteGuard } from "@/components/admin-route-guard"
import { CollectionForm } from "@/components/admin/CollectionForm"

export default function NewCollectionPage() {
	return (
		<AdminRouteGuard>
			<CollectionForm mode="create" />
		</AdminRouteGuard>
	)
}
