/**
 * Optimized Image Component
 * Next.js Image wrapper with performance optimizations
 * @module components/optimized-image
 */

'use client'

import * as React from 'react'
import Image, { ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'alt'> {
  alt: string
  aspectRatio?: '1/1' | '3/4' | '4/3' | '16/9' | '21/9'
  loading?: 'lazy' | 'eager'
  priority?: boolean
  quality?: number
}

/**
 * OptimizedImage Component
 * Automatically handles:
 * - Lazy loading
 * - Blur placeholders
 * - Responsive sizing
 * - Quality optimization
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  className,
  loading = 'lazy',
  priority = false,
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  // Calculate aspect ratio class
  const aspectRatioClass = aspectRatio
    ? {
        '1/1': 'aspect-square',
        '3/4': 'aspect-[3/4]',
        '4/3': 'aspect-[4/3]',
        '16/9': 'aspect-video',
        '21/9': 'aspect-[21/9]',
      }[aspectRatio]
    : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        aspectRatioClass,
        className
      )}
    >
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-all duration-300',
            isLoading && 'blur-sm scale-105',
            !isLoading && 'blur-0 scale-100'
          )}
          loading={priority ? 'eager' : loading}
          priority={priority}
          quality={quality}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true)
            setIsLoading(false)
          }}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Image not available</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
    </div>
  )
}

/**
 * ProductImage Component
 * Optimized for product images with consistent aspect ratio
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string
  alt: string
  priority?: boolean
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="3/4"
      priority={priority}
      quality={90}
      className={className}
    />
  )
}

/**
 * HeroImage Component
 * Optimized for hero/banner images
 */
export function HeroImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="16/9"
      priority={true}
      quality={95}
      className={className}
    />
  )
}
