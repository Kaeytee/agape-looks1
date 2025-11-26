"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Copy, TrendingUp, Percent, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { useCoupons, useDeleteCoupon } from "@/lib/hooks/useCoupons"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedCoupon, setSelectedCoupon] = React.useState<any>(null)

  const { data: couponsData, isLoading, refetch } = useCoupons({
    search: searchQuery,
    type: typeFilter === "all" ? undefined : typeFilter,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  })

  const deleteMutation = useDeleteCoupon()

  const coupons = couponsData?.coupons || []

  const handleDelete = async () => {
    if (!selectedCoupon) return

    try {
      await deleteMutation.mutateAsync(selectedCoupon.id)
      toast.success("Coupon deleted successfully")
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete coupon")
    } finally {
      setDeleteDialogOpen(false)
      setSelectedCoupon(null)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Coupon code copied to clipboard")
  }

  const getCouponTypeInfo = (type: string) => {
    switch (type) {
      case "percentage":
        return { label: "Percentage", icon: Percent, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" }
      case "fixed":
        return { label: "Fixed Amount", icon: TrendingUp, color: "bg-green-500/10 text-green-600 dark:text-green-400" }
      case "free_shipping":
        return { label: "Free Shipping", icon: Ticket, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" }
      default:
        return { label: type, icon: Ticket, color: "bg-gray-500/10 text-gray-600 dark:text-gray-400" }
    }
  }

  const getCouponValue = (coupon: any) => {
    switch (coupon.type) {
      case "percentage":
        return `${coupon.amountOrPct}%`
      case "fixed":
        return formatCurrency(coupon.amountOrPct)
      case "free_shipping":
        return "Free"
      default:
        return "-"
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <AdminRouteGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Coupon Management</h1>
            <p className="text-muted-foreground">Create and manage discount coupons</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/admin/coupons/new">
              <Plus className="h-4 w-4" />
              Create Coupon
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        {couponsData && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.filter((c: any) => c.isActive && !isExpired(c.expiresAt)).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Uses</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.reduce((sum: number, c: any) => sum + (c.totalUsage || 0), 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(coupons.reduce((sum: number, c: any) => sum + (c.totalDiscountGiven || 0), 0))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Coupons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>
              {coupons.length} {coupons.length === 1 ? "coupon" : "coupons"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No coupons found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first coupon to start offering discounts
                </p>
                <Button asChild>
                  <Link href="/admin/coupons/new">Create Coupon</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon: any) => {
                      const typeInfo = getCouponTypeInfo(coupon.type)
                      const TypeIcon = typeInfo.icon
                      const expired = isExpired(coupon.expiresAt)

                      return (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-semibold text-sm bg-muted px-2 py-1 rounded">
                                {coupon.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleCopyCode(coupon.code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            {coupon.description && (
                              <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={typeInfo.color}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{getCouponValue(coupon)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{coupon.totalUsage || 0} uses</div>
                              {coupon.usageLimit && (
                                <div className="text-xs text-muted-foreground">
                                  of {coupon.usageLimit} limit
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {expired ? (
                              <Badge variant="destructive">Expired</Badge>
                            ) : coupon.isActive ? (
                              <Badge variant="default" className="bg-success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {coupon.expiresAt ? (
                              <span className={expired ? "text-destructive" : ""}>
                                {formatDate(coupon.expiresAt)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">No expiry</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/coupons/${coupon.id}`}>
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedCoupon(coupon)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon <strong>{selectedCoupon?.code}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminRouteGuard>
  )
}
