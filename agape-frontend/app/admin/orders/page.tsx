"use client"

/**
 * Admin Orders Management Page
 * Allows admins to view, filter, and manage all orders
 * @page app/admin/orders
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, Loader2, Package, Truck, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { useAllOrders, useUpdateOrderStatus, useUpdateTrackingNumber } from "@/lib/hooks/useOrders"
import type { Order } from "@/lib/types"

// Status configuration
const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, icon: Package },
  paid: { label: "Paid", variant: "default" as const, icon: CheckCircle },
  processing: { label: "Processing", variant: "default" as const, icon: Package },
  shipped: { label: "Shipped", variant: "default" as const, icon: Truck },
  delivered: { label: "Delivered", variant: "success" as const, icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
}

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)
  const [trackingDialogOpen, setTrackingDialogOpen] = React.useState(false)
  const [newStatus, setNewStatus] = React.useState("")
  const [statusNotes, setStatusNotes] = React.useState("")
  const [trackingNumber, setTrackingNumber] = React.useState("")

  // Fetch orders with filters
  const { data: ordersData, isLoading, error } = useAllOrders(1, 100, statusFilter)
  const updateStatus = useUpdateOrderStatus()
  const updateTracking = useUpdateTrackingNumber()

  const orders = ordersData?.orders || []

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.shippingAddress.email.toLowerCase().includes(searchLower) ||
      `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
        .toLowerCase()
        .includes(searchLower)
    )
  })

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    await updateStatus.mutateAsync({
      orderId: selectedOrder.id,
      status: newStatus,
      notes: statusNotes || undefined,
    })

    setStatusDialogOpen(false)
    setSelectedOrder(null)
    setNewStatus("")
    setStatusNotes("")
  }

  // Handle tracking number update
  const handleTrackingUpdate = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return

    await updateTracking.mutateAsync({
      orderId: selectedOrder.id,
      trackingNumber: trackingNumber.trim(),
    })

    setTrackingDialogOpen(false)
    setSelectedOrder(null)
    setTrackingNumber("")
  }

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <main id="main-content" className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Orders Management</h1>
                <p className="text-muted-foreground">View and manage customer orders</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-center gap-3 p-6">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-destructive">Failed to load orders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(error as any)?.response?.data?.message || "Please try again later"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Table */}
            {!isLoading && !error && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => {
                        const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                        const StatusIcon = status.icon
                        const orderDate = new Date(order.createdAt).toLocaleDateString()

                        return (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{order.shippingAddress.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{orderDate}</TableCell>
                            <TableCell className="font-semibold">GHS {order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={status.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={order.paymentStatus === "completed" ? "success" : "outline"}>
                                {order.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/orders/${order.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setNewStatus(order.status)
                                    setStatusDialogOpen(true)
                                  }}
                                >
                                  Update Status
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setTrackingNumber(order.trackingNumber || "")
                                    setTrackingDialogOpen(true)
                                  }}
                                >
                                  <Truck className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Results Summary */}
            {!isLoading && !error && filteredOrders.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            )}
          </div>
        </main>

        {/* Update Status Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update the status for order {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this status change..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate} disabled={updateStatus.isPending}>
                {updateStatus.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Tracking Number</DialogTitle>
              <DialogDescription>
                Add or update tracking number for order {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tracking">Tracking Number</Label>
                <Input
                  id="tracking"
                  placeholder="Enter tracking number..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleTrackingUpdate}
                disabled={updateTracking.isPending || !trackingNumber.trim()}
              >
                {updateTracking.isPending ? "Updating..." : "Update Tracking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminRouteGuard>
  )
}
