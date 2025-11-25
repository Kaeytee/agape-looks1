"use client"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useProducts } from "@/lib/hooks/useProducts"
import { formatCurrency } from "@/lib/utils"

export function MiniCart() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, itemCount } = useCart()
  const { data: productsData } = useProducts({})

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40"
          />

          {/* Slide-over panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background shadow-modal z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="font-display text-xl font-semibold">Cart ({itemCount})</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Close cart">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-1">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground">Add some beautiful Lace to get started</p>
                  </div>
                  <Button onClick={closeCart} asChild>
                    <Link href="/shop">Shop Now</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const product = productsData?.products?.find((p: any) => p.id === item.productId)
                    if (!product) return null

                    const mainImage = product.images?.find((img: any) => img.type === "main") || product.images?.[0]

                    return (
                      <motion.div
                        key={`${item.productId}-${item.variantId || "default"}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex gap-4"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={closeCart}
                          className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted"
                        >
                          <Image
                            src={mainImage?.url || "/placeholder.svg?height=80&width=80"}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeCart}
                            className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                          >
                            {product.title}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatCurrency(item.price)}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-border rounded-(--radius-sm)">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeItem(item.productId, item.variantId)}
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
                <div className="space-y-2">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout" onClick={closeCart}>
                      Proceed to Checkout
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={closeCart} asChild>
                    <Link href="/cart">View Cart</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
