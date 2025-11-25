"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, CreditCard, Smartphone, Lock } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/lib/hooks/useProducts"
import { formatCurrency } from "@/lib/utils"
import type { ShippingAddress } from "@/lib/types"

const shippingMethods = [
  { id: "standard", name: "Standard Shipping", time: "5-7 business days", price: 50 },
  { id: "express", name: "Express Shipping", time: "2-3 business days", price: 100 },
  { id: "overnight", name: "Overnight Shipping", time: "1 business day", price: 200 },
]

const paymentMethods = [
  { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, subtotal } = useCart()
  const { data: productsData } = useProducts({})
  const [currentStep, setCurrentStep] = React.useState<"shipping" | "payment" | "review">("shipping")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [selectedShippingMethod, setSelectedShippingMethod] = React.useState("standard")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState("momo")

  const [shippingInfo, setShippingInfo] = React.useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "Ghana",
    notes: "",
  })

  const [selectedShipping, setSelectedShipping] = React.useState("standard")
  const [selectedPayment, setSelectedPayment] = React.useState("momo")

  const shippingCost = shippingMethods.find((m) => m.id === selectedShipping)?.price || 0
  const total = subtotal + shippingCost

  React.useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items, router])

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep("payment")
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate order number
      const orderNumber = `AGW-${Date.now().toString().slice(-8)}`

      // Clear cart and redirect to success page
      clearCart()
      router.push(`/checkout/success?order=${orderNumber}`)
    } catch (error) {
      console.error("Payment processing failed:", error)
      setIsProcessing(false)
    }
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

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8 gap-2">
            {["shipping", "payment", "review"].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep === step
                        ? "bg-primary text-primary-foreground"
                        : index < ["shipping", "payment", "review"].indexOf(currentStep)
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium capitalize">{step}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 ${
                      index < ["shipping", "payment", "review"].indexOf(currentStep) ? "bg-success" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              {currentStep === "shipping" && (
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="bg-card border border-border rounded-(--radius-md) p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Shipping Information</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          required
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          placeholder="+233 XX XXX XXXX"
                          value={shippingInfo.phone}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="addressLine1">Address Line 1 *</Label>
                        <Input
                          id="addressLine1"
                          required
                          value={shippingInfo.addressLine1}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="addressLine2">Address Line 2</Label>
                        <Input
                          id="addressLine2"
                          value={shippingInfo.addressLine2}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region *</Label>
                        <Input
                          id="region"
                          required
                          value={shippingInfo.region}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, region: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          placeholder="Any special instructions for delivery..."
                          value={shippingInfo.notes}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="bg-card border border-border rounded-(--radius-md) p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Shipping Method</h2>

                    <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                      <div className="space-y-3">
                        {shippingMethods.map((method) => (
                          <div
                            key={method.id}
                            className="flex items-center space-x-3 border border-border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{method.name}</p>
                                  <p className="text-sm text-muted-foreground">{method.time}</p>
                                </div>
                                <p className="font-semibold">
                                  {method.price === 0 ? "Free" : formatCurrency(method.price)}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Continue to Payment
                  </Button>
                </form>
              )}

              {/* Payment Method */}
              {currentStep === "payment" && (
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  <div className="bg-card border border-border rounded-(--radius-md) p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Payment Method</h2>

                    <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon
                          return (
                            <div
                              key={method.id}
                              className="flex items-center space-x-3 border border-border rounded-md p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              <RadioGroupItem value={method.id} id={method.id} />
                              <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{method.name}</p>
                                    <p className="text-sm text-muted-foreground">{method.description}</p>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          )
                        })}
                      </div>
                    </RadioGroup>

                    <div className="mt-6 p-4 bg-muted/50 rounded-md flex items-start gap-3">
                      <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Secure Payment</p>
                        <p>Your payment information is encrypted and secure. We never store your card details.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 bg-transparent"
                      onClick={() => setCurrentStep("shipping")}
                    >
                      Back
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" disabled={isProcessing}>
                      {isProcessing ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              )}
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

                {/* Totals */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                    </span>
                  </div>
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
