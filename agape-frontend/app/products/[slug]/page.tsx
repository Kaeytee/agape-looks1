"use client"

import { Label } from "@/components/ui/label"

import * as React from "react"
import { use } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Share2, Minus, Plus, ShoppingCart, Truck, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { cn, formatCurrency } from "@/lib/utils"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/contexts/wishlist-context"
import { useProduct, useProducts } from "@/lib/hooks/useProducts"
import { ProductCardSkeleton } from "@/components/loading-skeleton"

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  
  // Fetch product from API
  const { data: product, isLoading, error } = useProduct(slug)
  const { data: allProductsData } = useProducts({ limit: 4 })
  
  const [selectedImage, setSelectedImage] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)
  const [selectedVariant, setSelectedVariant] = React.useState<string | null>(null)
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Related products (excluding current product)
  const relatedProducts = allProductsData?.products?.filter((p) => p.id !== product?.id).slice(0, 4) || []
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }
  
  // Error or not found
  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/shop">Browse All Products</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(product.inventory, quantity + delta)))
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant || undefined)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-foreground transition-colors">
                Shop
              </Link>
              <span>/</span>
              <span className="text-foreground">{product.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative aspect-[3/4] rounded-(--radius-lg) overflow-hidden bg-muted"
              >
                <Image
                  src={product.images[selectedImage]?.url || "/placeholder.svg?height=800&width=600"}
                  alt={product.images[selectedImage]?.alt || product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "relative aspect-square rounded-md overflow-hidden border-2 transition-all",
                      selectedImage === index ? "border-primary" : "border-transparent hover:border-border",
                    )}
                  >
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title and badges */}
              <div>
                <div className="flex gap-2 mb-3">
                  {product.isLimited && <Badge variant="limited">Limited Edition</Badge>}
                  {product.tags.includes("Handwoven") && <Badge variant="gold">Handwoven</Badge>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
                {product.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">★</span>
                      <span className="font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-3xl font-bold">
                {formatCurrency(product.price)}
              </div>

              {/* Story */}
              <p className="text-muted-foreground leading-relaxed">{product.fullStory}</p>

              {/* Variants */}
              {product.variants.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Size</Label>
                  <div className="flex gap-2">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant === variant.id ? "default" : "outline"}
                        onClick={() => setSelectedVariant(variant.id)}
                      >
                        {variant.value}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-(--radius-sm)">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.inventory}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{product.inventory} available</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1 gap-2" disabled={product.inventory === 0} onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => {
                    if (isInWishlist(product.id)) {
                      removeFromWishlist(product.id)
                    } else {
                      addToWishlist(product)
                    }
                  }}
                >
                  <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current text-destructive")} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Trust signals */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <span>Ships in {product.dispatchTime}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span>Handwoven in {product.weaveOrigin}</span>
                </div>
              </div>

              {/* Additional Info Tabs */}
              <Tabs defaultValue="details" className="pt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="care">Care</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{product.sku}</span>
                    <span className="text-muted-foreground">Origin:</span>
                    <span className="font-medium">{product.weaveOrigin}</span>
                    <span className="text-muted-foreground">Dimensions:</span>
                    <span className="font-medium">
                      {product.dimensions.width} × {product.dimensions.length} {product.dimensions.unit}
                    </span>
                  </div>
                </TabsContent>
                <TabsContent value="care" className="text-sm text-muted-foreground">
                  {product.careInstructions}
                </TabsContent>
                <TabsContent value="shipping" className="text-sm text-muted-foreground">
                  Free shipping on orders over GHS 500. Standard delivery takes 5-7 business days. Express shipping
                  available at checkout.
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Related Products */}
          <section className="mt-16 md:mt-24">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
