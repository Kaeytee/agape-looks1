/**
 * Wishlist Page
 * Displays user's saved wishlist items
 * @page app/wishlist
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { SlideButton } from '@/components/ui/animated-button'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { ProductCard } from '@/components/product-card'
import { EmptyWishlist } from '@/components/empty-state'
import { useWishlist } from '@/lib/contexts/wishlist-context'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/loading-skeleton'
import { Trash2, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function WishlistPage() {
  const router = useRouter()
  const { items, itemCount, isLoading, clearWishlist } = useWishlist()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist()
    }
  }

  // Handle shop click
  const handleShopClick = () => {
    router.push('/shop')
  }

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
                items={[{ label: 'Wishlist', href: '/wishlist' }]}
                className="mb-6"
              />

              <div className="flex items-center justify-between">
                <div>
                  <TypewriterEffectSmooth
                    words={[
                      { text: 'My', className: 'text-foreground' },
                      { text: 'Wishlist', className: 'text-primary' },
                    ]}
                    className="mb-6"
                  />
                  <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
                    {!mounted || isLoading ? 'Loading your saved items...' : `${itemCount} item${itemCount !== 1 ? 's' : ''} saved for later`}
                  </p>
                </div>

                {mounted && itemCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearWishlist}
                    className="hidden md:flex"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Wishlist Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Loading State */}
            {(!mounted || isLoading) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {mounted && !isLoading && itemCount === 0 && (
              <EmptyWishlist onShopClick={handleShopClick} />
            )}

            {/* Wishlist Items */}
            {mounted && !isLoading && itemCount > 0 && (
              <>
                {/* Mobile Clear Button */}
                <div className="md:hidden mb-6">
                  <Button
                    variant="outline"
                    onClick={handleClearWishlist}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <div className="mt-12 text-center">
                  <SlideButton onClick={handleShopClick} size="lg">
                    Continue Shopping
                  </SlideButton>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
