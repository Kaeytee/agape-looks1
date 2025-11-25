"use client"

/**
 * Order Details Page
 * Displays complete details of a single order
 * @page app/account/orders/[id]
 */

import * as React from "react"
import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Loader2, AlertCircle, MapPin, CreditCard, Calendar } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useOrder } from "@/lib/hooks/useOrders"
import type { Order } from "@/lib/types"

// Status configuration
const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const, icon: Package, color: "text-muted-foreground" },
  paid: { label: "Paid", variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
  processing: { label: "Processing", variant: "default" as const, icon: Package, color: "text-blue-600" },
  shipped: { label: "Shipped", variant: "default" as const, icon: Truck, color: "text-purple-600" },
  delivered: { label: "Delivered", variant: "success" as const, icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: order, isLoading, error } = useOrder(id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md border-destructive/50 bg-destructive/5">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive text-lg">Order Not Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This order doesn't exist or you don't have permission to view it.
                </p>
              </div>
              <Button asChild className="mt-2">
                <Link href="/account/orders">Back to Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = status.icon
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/account/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Order {order.orderNumber}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant={status.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {orderDate}
                </span>
              </div>
            </div>
            
            {order.trackingNumber && (
              <Button asChild>
                <Link href={`/track?order=${order.orderNumber}`}>
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </Link>
              </Button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">Product #{item.productId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            GHS {(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            GHS {item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p className="text-sm">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p className="text-sm">{order.shippingAddress.addressLine2}</p>
                    )}
                    <p className="text-sm">
                      {order.shippingAddress.city}, {order.shippingAddress.region}
                    </p>
                    <p className="text-sm">{order.shippingAddress.country}</p>
                    {order.shippingAddress.postalCode && (
                      <p className="text-sm">{order.shippingAddress.postalCode}</p>
                    )}
                    <Separator className="my-3" />
                    <p className="text-sm">
                      <strong>Email:</strong> {order.shippingAddress.email}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {order.shippingAddress.phone}
                    </p>
                    {order.shippingAddress.notes && (
                      <>
                        <Separator className="my-3" />
                        <p className="text-sm text-muted-foreground">
                          <strong>Delivery Notes:</strong> {order.shippingAddress.notes}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">GHS {order.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-GHS {order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {order.shipping === 0 ? "FREE" : `GHS ${order.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl">GHS {order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={order.paymentStatus === "completed" ? "success" : "outline"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Information */}
              {order.trackingNumber && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                    <p className="font-mono text-sm font-semibold break-all">
                      {order.trackingNumber}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
