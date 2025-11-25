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

  // Find style and material images
  const findImagePair = () => {
    // First, try to find a style image
    const styleImage = product.images.find((img) =>
      img.url.toLowerCase().includes('-style-')
    )

    if (styleImage) {
      // If we have a style image, find the corresponding material image
      // Convert: beaded-lace-style-black1.jpeg -> beaded-lace-material-black1.jpeg
      const materialUrl = styleImage.url.replace(/-style-/i, '-material-')
      const materialImage = product.images.find((img) => img.url === materialUrl)

      return {
        defaultImage: styleImage,
        hoverImage: materialImage || styleImage, // Fallback to style if no material found
      }
    }

    // If no style image, just use the main/first image
    const mainImage = product.images.find((img) => img.type === "main") || product.images[0]
    return {
      defaultImage: mainImage,
      hoverImage: mainImage, // No hover effect if only material image
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
