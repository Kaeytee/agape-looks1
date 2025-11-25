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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
        {mounted && itemCount > 0 && (
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

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
      )}
    </div>
  )
}
