"use client"

import * as React from "react"
import { useSettings, useUpdateSetting } from "@/lib/hooks/useSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Loader2 } from "lucide-react"

export default function AdminSettingsPage() {
	const { data: settings, isLoading } = useSettings()
	const updateSetting = useUpdateSetting()

	const [deliveryFee, setDeliveryFee] = React.useState("")
	const [freeShippingThreshold, setFreeShippingThreshold] = React.useState("")

	React.useEffect(() => {
		if (settings) {
			setDeliveryFee(settings.delivery_fee?.value?.amount?.toString() || "50")
			setFreeShippingThreshold(settings.free_shipping_threshold?.value?.amount?.toString() || "500")
		}
	}, [settings])

	const handleSave = async () => {
		try {
			await updateSetting.mutateAsync({
				key: "delivery_fee",
				value: { amount: parseFloat(deliveryFee), currency: "GHS" }
			})

			await updateSetting.mutateAsync({
				key: "free_shipping_threshold",
				value: { amount: parseFloat(freeShippingThreshold), currency: "GHS" }
			})
		} catch (error) {
			console.error("Failed to save settings", error)
		}
	}

	if (isLoading) {
		return (
			<AdminRouteGuard>
				<div className="flex items-center justify-center h-96">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			</AdminRouteGuard>
		)
	}

	return (
		<AdminRouteGuard>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground">
						Manage store configuration and delivery fees.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Delivery Configuration</CardTitle>
						<CardDescription>
							Set the standard delivery fee and free shipping threshold.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-2">
							<Label htmlFor="delivery-fee">Standard Delivery Fee (GHS)</Label>
							<Input
								id="delivery-fee"
								type="number"
								value={deliveryFee}
								onChange={(e) => setDeliveryFee(e.target.value)}
								placeholder="50.00"
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="free-shipping">Free Shipping Threshold (GHS)</Label>
							<Input
								id="free-shipping"
								type="number"
								value={freeShippingThreshold}
								onChange={(e) => setFreeShippingThreshold(e.target.value)}
								placeholder="500.00"
							/>
							<p className="text-xs text-muted-foreground">
								Orders above this amount will have free shipping.
							</p>
						</div>

						<Button
							onClick={handleSave}
							disabled={updateSetting.isPending}
						>
							{updateSetting.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</CardContent>
				</Card>
			</div>
		</AdminRouteGuard>
	)
}
