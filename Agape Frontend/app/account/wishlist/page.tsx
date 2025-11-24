"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Heart } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ProductCard } from "@/components/product-card"
import { useWishlist } from "@/lib/contexts/wishlist-context"
import { ProductCardSkeleton } from "@/components/loading-skeleton"

export default function WishlistPage() {
  const { items: wishlistProducts, isLoading } = useWishlist()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/red-green-gold-kente-stole.jpg"
              alt="Wishlist"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Breadcrumb
                items={[
                  { label: 'Account', href: '/account' },
                  { label: 'Wishlist', href: '/account/wishlist' }
                ]}
                className="mb-6"
              />
              
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">My Wishlist</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved for later
              </p>
            </motion.div>
          </div>
        </section>

        {/* Wishlist Content */}
        <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">{isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="font-display text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">Save items you love to your wishlist</p>
              <Button asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          )}
        </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
