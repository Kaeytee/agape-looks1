/**
 * Order Tracking Page
 * Allows customers to track their order status with timeline visualization
 * @page app/track
 */

'use client'

import * as React from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  Search,
  MapPin,
  Calendar,
  Box
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Order status type
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Order tracking data interface
interface OrderTracking {
  orderNumber: string
  status: OrderStatus
  currentLocation?: string
  estimatedDelivery: string
  trackingNumber?: string
  timeline: TimelineEvent[]
  items: OrderItem[]
  shippingAddress: {
    name: string
    address: string
    city: string
    phone: string
  }
}

interface TimelineEvent {
  status: string
  description: string
  location?: string
  timestamp: string
  completed: boolean
}

interface OrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [trackingData, setTrackingData] = React.useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  // Handle order tracking
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for demonstration
      setTrackingData({
        orderNumber: orderNumber.toUpperCase(),
        status: 'shipped',
        currentLocation: 'Accra Distribution Center',
        estimatedDelivery: '2025-10-16',
        trackingNumber: 'GH' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        timeline: [
          {
            status: 'Order Placed',
            description: 'Your order has been received',
            timestamp: '2025-10-12T10:30:00Z',
            completed: true,
          },
          {
            status: 'Processing',
            description: 'Your order is being prepared',
            location: 'Kumasi Workshop',
            timestamp: '2025-10-13T14:20:00Z',
            completed: true,
          },
          {
            status: 'Shipped',
            description: 'Your order is on the way',
            location: 'Accra Distribution Center',
            timestamp: '2025-10-14T09:15:00Z',
            completed: true,
          },
          {
            status: 'Out for Delivery',
            description: 'Your order is out for delivery',
            timestamp: '',
            completed: false,
          },
          {
            status: 'Delivered',
            description: 'Order delivered successfully',
            timestamp: '',
            completed: false,
          },
        ],
        items: [
          {
            id: '1',
            name: 'Traditional Lace - Royal Gold',
            image: '/kente-product-1.jpg',
            quantity: 1,
            price: 450,
          },
        ],
        shippingAddress: {
          name: 'John Doe',
          address: '123 Independence Avenue',
          city: 'Accra, Ghana',
          phone: '+233 24 123 4567',
        },
      })
    } catch (err) {
      setError('Unable to track order. Please check your order number and email.')
    } finally {
      setIsLoading(false)
    }
  }

  // Get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'processing':
        return 'default'
      case 'shipped':
        return 'default'
      case 'delivered':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Breadcrumb
              items={[{ label: 'Track Order', href: '/track' }]}
              className="mb-4"
            />

            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Track Your Order
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Enter your order number and email to track your shipment
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Tracking Form */}
            <AnimatePresence mode="wait">
              {!trackingData ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl shadow-card p-8"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  <form onSubmit={handleTrackOrder} className="space-y-6">
                    {/* Order Number */}
                    <div className="space-y-2">
                      <Label htmlFor="orderNumber">Order Number</Label>
                      <Input
                        id="orderNumber"
                        type="text"
                        placeholder="e.g., ORD-12345"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        required
                        className="h-12"
                      />
                      <p className="text-sm text-muted-foreground">
                        Found in your order confirmation email
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Tracking...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-5 w-5" />
                          Track Order
                        </>
                      )}
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Order Header */}
                  <div className="bg-card rounded-2xl shadow-card p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          Order #{trackingData.orderNumber}
                        </h2>
                        <Badge variant={getStatusColor(trackingData.status)}>
                          {trackingData.status.toUpperCase()}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setTrackingData(null)}
                      >
                        Track Another Order
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                          <p className="font-medium">
                            {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {trackingData.currentLocation && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Current Location</p>
                            <p className="font-medium">{trackingData.currentLocation}</p>
                          </div>
                        </div>
                      )}

                      {trackingData.trackingNumber && (
                        <div className="flex items-start gap-3">
                          <Package className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Tracking Number</p>
                            <p className="font-medium font-mono text-sm">
                              {trackingData.trackingNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-card rounded-2xl shadow-card p-6">
                    <h3 className="text-xl font-bold mb-6">Shipping Timeline</h3>
                    <div className="space-y-6">
                      {trackingData.timeline.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          {/* Timeline Icon */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center',
                                event.completed
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {event.completed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Clock className="h-5 w-5" />
                              )}
                            </div>
                            {index < trackingData.timeline.length - 1 && (
                              <div
                                className={cn(
                                  'w-0.5 h-12 mt-2',
                                  event.completed ? 'bg-primary' : 'bg-border'
                                )}
                              />
                            )}
                          </div>

                          {/* Timeline Content */}
                          <div className="flex-1 pb-6">
                            <h4 className="font-semibold mb-1">{event.status}</h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              {event.description}
                            </p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                            {event.timestamp && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-card rounded-2xl shadow-card p-6">
                    <h3 className="text-xl font-bold mb-4">Shipping Address</h3>
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{trackingData.shippingAddress.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {trackingData.shippingAddress.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {trackingData.shippingAddress.city}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trackingData.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
