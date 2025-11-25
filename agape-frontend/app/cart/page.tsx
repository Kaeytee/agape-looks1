"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/lib/hooks/useProducts"
import { formatCurrency } from "@/lib/utils"

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  // Fetch products to get full product details
  const { data: productsData } = useProducts({})
  const [promoCode, setPromoCode] = React.useState("")
  const [promoApplied, setPromoApplied] = React.useState(false)

  const discount = promoApplied ? subtotal * 0.05 : 0
  const shipping = subtotal > 500 ? 0 : 50
  const total = subtotal - discount + shipping

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    if (promoCode.toLowerCase() === "welcome5") {
      setPromoApplied(true)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <ShoppingBag className="h-24 w-24 text-muted-foreground" />
              <div>
                <h2 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Discover our beautiful collection of authentic Lace</p>
                <Button size="lg" asChild>
                  <Link href="/shop">
                    Start Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = productsData?.products?.find((p: any) => p.id === item.productId)
                  if (!product) return null

                  const mainImage = product.images?.find((img: any) => img.type === "main") || product.images?.[0]

                  return (
                    <div
                      key={`${item.productId}-${item.variantId || "default"}`}
                      className="flex gap-4 p-4 border border-border rounded-(--radius-md) bg-card"
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                      >
                        <Image
                          src={mainImage?.url || "/placeholder.svg?height=128&width=128"}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-display text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{product.weaveOrigin}</p>
                        <p className="text-lg font-semibold mt-2">
                          {formatCurrency(item.price)}
                        </p>

                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-border rounded-(--radius-sm)">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => removeItem(item.productId, item.variantId)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <div className="border border-border rounded-(--radius-md) p-6 bg-card">
                    <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                      </div>

                      {promoApplied && (
                        <div className="flex justify-between text-success">
                          <span>Discount (5%)</span>
                          <span>-{formatCurrency(discount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                      </div>

                      {subtotal < 500 && (
                        <p className="text-xs text-muted-foreground">
                          Add {formatCurrency(500 - subtotal)} more for free shipping
                        </p>
                      )}

                      <div className="border-t border-border pt-3 flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Button className="w-full mt-6" size="lg" asChild>
                      <Link href="/checkout">
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>

                    <Button variant="outline" className="w-full mt-2 bg-transparent" asChild>
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </div>

                  {/* Promo code */}
                  <div className="border border-border rounded-(--radius-md) p-6 bg-card">
                    <h3 className="font-semibold mb-3">Promo Code</h3>
                    <form onSubmit={handleApplyPromo} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        disabled={promoApplied}
                      />
                      <Button type="submit" variant="outline" disabled={promoApplied}>
                        {promoApplied ? "Applied" : "Apply"}
                      </Button>
                    </form>
                    {promoApplied && <p className="text-sm text-success mt-2">Promo code applied successfully!</p>}
                  </div>

                  {/* Trust signals */}
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      Secure payment processing
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      Authentic handwoven guarantee
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      Free returns within 30 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
