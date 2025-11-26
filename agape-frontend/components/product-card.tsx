"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { ANIMATION } from "@/lib/constants"
import { useWishlist } from "@/lib/contexts/wishlist-context"

interface ProductCardProps {
  product: Product
  onQuickView?: (product: Product) => void
  className?: string
}

export function ProductCard({
  product,
  onQuickView,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  // Find default and hover images
  const findImagePair = () => {
    // Safety check for images
    if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
      return { defaultImage: undefined, hoverImage: undefined }
    }

    // Sort images by order if available
    const sortedImages = [...product.images].sort((a, b) => (a.order || 0) - (b.order || 0))

    // Default image is always the first one
    const defaultImage = sortedImages[0]

    // Hover image is the second one if available, otherwise fallback to default
    const hoverImage = sortedImages.length > 1 ? sortedImages[1] : defaultImage

    return {
      defaultImage,
      hoverImage,
    }
  }

  const { defaultImage, hoverImage } = findImagePair()
  const currentImage = isHovered && hoverImage !== defaultImage ? hoverImage : defaultImage

  // Check if product is in wishlist
  const inWishlist = isInWishlist(product.id)

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (inWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION.duration.normal / 1000 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
          <Image
            src={currentImage?.url || "/placeholder.svg?height=600&width=450"}
            alt={currentImage?.alt || product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Actions Overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full shadow-sm"
              onClick={handleWishlistToggle}
            >
              <Heart className={cn("h-4 w-4 transition-colors", inWishlist && "fill-destructive text-destructive")} />
              <span className="sr-only">{inWishlist ? "Remove from wishlist" : "Add to wishlist"}</span>
            </Button>
            {onQuickView && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full shadow-sm"
                onClick={(e) => {
                  e.preventDefault()
                  onQuickView(product)
                }}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Quick view</span>
              </Button>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          {/* Product title */}
          <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <p className="text-sm font-semibold text-foreground">
            {formatCurrency(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
