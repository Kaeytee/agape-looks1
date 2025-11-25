"use client"

/**
 * User Orders Page
 * Displays user's order history with real-time data from API
 * @page app/account/orders
 */

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useOrders } from "@/lib/hooks/useOrders"
import type { Order } from "@/lib/types"

// Status configuration for order states
const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, icon: Package },
  paid: { label: "Paid", variant: "default" as const, icon: CheckCircle },
  processing: { label: "Processing", variant: "default" as const, icon: Package },
  shipped: { label: "Shipped", variant: "default" as const, icon: Truck },
  delivered: { label: "Delivered", variant: "success" as const, icon: CheckCircle },
  cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
}

export default function OrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  
  // Check authentication before making API calls
  React.useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])
  
  // Fetch orders from API with React Query (only if authenticated)
  const { data: ordersData, isLoading, error } = useOrders(1, 50)
  
  const orders = ordersData?.orders || []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/account">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </Link>
          </Button>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">My Orders</h1>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your orders...</p>
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

          {/* Empty State */}
          {!isLoading && !error && orders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="font-display text-2xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here
                </p>
                <Button asChild>
                  <Link href="/shop">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Orders List */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order: Order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                const StatusIcon = status.icon
                const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })

                // Calculate total items
                const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)

                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display text-lg font-semibold">Order {order.orderNumber}</h3>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Placed on {orderDate}</p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-1">
                          <p className="font-display text-2xl font-bold">
                            GHS {order.total.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {totalItems} {totalItems === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping to:</span>
                          <span className="font-medium text-right">
                            {order.shippingAddress.city}, {order.shippingAddress.region}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment:</span>
                          <span className="font-medium">{order.paymentMethod}</span>
                        </div>

                        {order.trackingNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tracking:</span>
                            <span className="font-mono text-xs font-medium">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" asChild className="flex-1">
                          <Link href={`/account/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>

                        {order.trackingNumber && (
                          <Button variant="default" asChild className="flex-1">
                            <Link href={`/track?order=${order.orderNumber}`}>
                              Track Order
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
