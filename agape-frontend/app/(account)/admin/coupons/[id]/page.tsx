"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { CouponForm } from "@/components/admin/coupon-form" 
import { useCouponById, useUpdateCoupon } from "@/lib/hooks/useCoupons"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: couponData, isLoading } = useCouponById(params.id)
  const updateMutation = useUpdateCoupon()

  const handleSubmit = async (data: any) => {
    try {
      await updateMutation.mutateAsync({ id: params.id, data })
      toast.success("Coupon updated successfully")
      router.push("/admin/coupons")
    } catch (error: any) {
      toast.error(error.message || "Failed to update coupon")
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
            <h1 className="font-display text-3xl font-bold">Edit Coupon</h1>
            <p className="text-muted-foreground">Update coupon settings and status</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : couponData ? (
          <CouponForm
            initialData={couponData.coupon}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            isEdit
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Coupon not found</p>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  )
}
