"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { CouponForm } from "@/components/admin/coupon-form"
import { useCreateCoupon } from "@/lib/hooks/useCoupons"
import { toast } from "sonner"

export default function NewCouponPage() {
  const router = useRouter()
  const createMutation = useCreateCoupon()

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success("Coupon created successfully")
      router.push("/admin/coupons")
    } catch (error: any) {
      toast.error(error.message || "Failed to create coupon")
      throw error
    }
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/coupons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold">Create New Coupon</h1>
            <p className="text-muted-foreground">Set up a new discount or free shipping coupon</p>
          </div>
        </div>

        <CouponForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </div>
    </AdminRouteGuard>
  )
}
