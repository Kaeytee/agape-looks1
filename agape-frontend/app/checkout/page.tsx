"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Lock, Ticket, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/lib/hooks/useProducts"
import { useApplyCoupon } from "@/lib/hooks/useCoupons"
import { useAuth } from "@/lib/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import api from "@/lib/api/client"

// Ghana's 16 Regions
const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
]




export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, clearCart, subtotal, deliveryFee, freeShippingThreshold } = useCart()
  const { data: productsData } = useProducts({})
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  // Handle hydration mismatch
  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const [shippingInfo, setShippingInfo] = React.useState({
    firstName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    notes: "",
  })

  // Pre-fill user data
  React.useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || prev.firstName,
        email: user.email || prev.email,
      }))
    }
  }, [user])

  // Coupon state
  const [couponCode, setCouponCode] = React.useState("")
  const [appliedCoupon, setAppliedCoupon] = React.useState<{
    code: string
    type: "percentage" | "fixed" | "free_shipping"
    discount: number
    freeShipping: boolean
    description?: string
  } | null>(null)
  const applyCouponMutation = useApplyCoupon()

  // Load coupon from localStorage on mount
  React.useEffect(() => {
    const savedCoupon = localStorage.getItem("agape-looks-coupon")
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon))
      } catch (error) {
        console.error("Failed to parse saved coupon:", error)
        localStorage.removeItem("agape-looks-coupon")
      }
    }
  }, [])

  // Save coupon to localStorage when it changes
  React.useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("agape-looks-coupon", JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem("agape-looks-coupon")
    }
  }, [appliedCoupon])

  // Coupon handlers
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return

    try {
      const result = await applyCouponMutation.mutateAsync({
        code: couponCode.trim(),
        cartSubtotal: subtotal,
        shippingFee: deliveryFee,
      })

      const couponData = {
        code: result.coupon?.code || result.code,
        type: result.coupon?.type || result.type,
        discount: result.discount,
        freeShipping: result.freeShipping,
        description: result.coupon?.description || result.description,
      }
      setAppliedCoupon(couponData)
      setCouponCode("")
      toast.success(`Coupon "${couponData.code}" applied successfully!`)
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Invalid coupon code"
      toast.error(message)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    toast.info("Coupon removed")
  }

  // Calculate shipping cost
  const shippingCost = appliedCoupon?.freeShipping ? 0 : (subtotal > freeShippingThreshold ? 0 : deliveryFee)
  const discount = appliedCoupon?.discount || 0
  const total = subtotal - discount + shippingCost

  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.region) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check if user is authenticated
    if (!user) {
      toast.error("Please log in to complete your purchase")
      router.push(`/auth/login?redirect=/checkout`)
      return
    }

    // Check if token exists
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      toast.error("Your session has expired. Please log in again.")
      router.push(`/auth/login?redirect=/checkout`)
      return
    }

    setIsProcessing(true)

    try {
      // 1. Create order - match backend schema exactly
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: shippingInfo.firstName,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.region,
          country: "Ghana",
        },
        couponCode: appliedCoupon?.code || undefined,
        metadata: {
          email: shippingInfo.email,
          notes: shippingInfo.notes || "",
        },
      }

      console.log('[Checkout] Creating order...', { itemCount: items.length, total })
      toast.loading("Creating order...", { id: "checkout" })

      const orderResponse = await api.post("/orders", orderData)

      // Extract order object from response
      // Backend returns {status: 'success', data: {id: ..., order_number: ...}}
      const responseData = orderResponse.data.data || orderResponse.data
      const order = responseData.order || responseData

      // Get the order ID
      const orderId = order.id

      if (!orderId) {
        console.error('[Checkout] No orderId in response:', orderResponse.data)
        throw new Error("Failed to create order - no order ID returned")
      }

      console.log('[Checkout] Order created successfully', {
        orderId,
        orderNumber: order.order_number || order.orderNumber
      })

      // 2. Initialize Paystack payment
      console.log('[Checkout] Initializing payment...', { orderId, amount: total })
      toast.loading("Initializing payment...", { id: "checkout" })

      const paymentResponse = await api.post("/payments/initialize", {
        orderId: orderId,
        amount: total,
      })

      const paymentData = paymentResponse.data.data || paymentResponse.data

      console.log('[Checkout] Payment initialized', {
        paymentId: paymentData.paymentId,
        reference: paymentData.reference,
        hasAuthUrl: !!paymentData.authorizationUrl
      })

      // 3. Clear cart and coupon before redirecting
      clearCart()
      localStorage.removeItem("agape-looks-coupon")

      toast.success("Redirecting to payment...", { id: "checkout" })

      // 4. Redirect to Paystack
      if (paymentData.authorizationUrl) {
        console.log('[Checkout] Redirecting to Paystack...')
        window.location.href = paymentData.authorizationUrl
      } else {
        throw new Error("No payment URL received")
      }
    } catch (error: any) {
      console.error("[Checkout] Payment failed:", error)

      // Handle specific error types
      let message = "Checkout failed. Please try again."

      if (error.response?.status === 401) {
        message = "Your session has expired. Please log in again."
        toast.error(message, { id: "checkout" })
        setTimeout(() => {
          router.push(`/auth/login?redirect=/checkout`)
        }, 1500)
        return
      } else if (error.response?.status === 403) {
        message = "You don't have permission to complete this action."
      } else if (error.response?.status === 408 || error.code === 'ECONNABORTED') {
        message = "Request timed out. Please check your connection and try again."
      } else if (error.response?.status === 500) {
        message = "Server error. Please try again in a few moments."
      } else if (error.response?.data?.message) {
        message = error.response.data.message
      } else if (error.message) {
        message = error.message
      }

      console.log('[Checkout] Error details:', {
        status: error.response?.status,
        message: message,
        data: error.response?.data
      })

      toast.error(message, { id: "checkout" })
      setIsProcessing(false)
    }
  }


  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Checkout</h1>

          {/* Authentication Warning */}
          {!user && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-md flex items-start gap-3">
              <Lock className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">Login Required</p>
                <p className="text-muted-foreground">
                  Please{" "}
                  <Link href="/auth/login?redirect=/checkout" className="underline hover:text-foreground">
                    log in
                  </Link>
                  {" "}to complete your purchase.
                </p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Information */}
              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="bg-card border border-border rounded-(--radius-md) p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Delivery Information</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        autoComplete="name"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder="+233 XX XXX XXXX"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        autoComplete="street-address"
                        required
                        placeholder="Street address, house number, landmark"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City/Town *</Label>
                      <Input
                        id="city"
                        name="city"
                        autoComplete="address-level2"
                        required
                        placeholder="e.g. Accra, Kumasi"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Region *</Label>
                      <Select
                        value={shippingInfo.region}
                        onValueChange={(value) => setShippingInfo({ ...shippingInfo, region: value })}
                      >
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {GHANA_REGIONS.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        autoComplete="off"
                        placeholder="Any special instructions for delivery..."
                        value={shippingInfo.notes}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Secure Payment Notice */}
                <div className="p-4 bg-muted/50 rounded-md flex items-start gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Secure Payment via Paystack</p>
                    <p>You'll be redirected to Paystack to complete your payment securely.</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!shippingInfo.region || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(total)}`
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 bg-card border border-border rounded-(--radius-md) p-6">
                <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => {
                    const product = productsData?.products?.find((p: any) => p.id === item.productId)
                    if (!product) return null

                    const mainImage = product.images?.find((img: any) => img.type === "main") || product.images?.[0]

                    return (
                      <div key={`${item.productId}-${item.variantId || "default"}`} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={mainImage?.url || "/placeholder.svg?height=64&width=64"}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Coupon Code */}
                <div className="mb-4 pb-4 border-b border-border">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-md">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-success" />
                        <div>
                          <p className="text-sm font-medium text-success">{appliedCoupon.code}</p>
                          <p className="text-xs text-muted-foreground">
                            {appliedCoupon.type === "percentage" && `${appliedCoupon.discount}% off`}
                            {appliedCoupon.type === "fixed" && `${formatCurrency(appliedCoupon.discount)} off`}
                            {appliedCoupon.type === "free_shipping" && "Free shipping"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-2">
                      <Label htmlFor="coupon" className="text-sm">Coupon Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          name="coupon"
                          autoComplete="off"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          disabled={applyCouponMutation.isPending || !couponCode.trim()}
                          className="bg-transparent"
                        >
                          {applyCouponMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Apply"
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                  {appliedCoupon?.freeShipping && (
                    <p className="text-xs text-success">Free shipping applied!</p>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border space-y-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    Secure checkout
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    Authentic guarantee
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-success">✓</span>
                    Free returns within 30 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
