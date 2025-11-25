/**
 * Collections Page
 * Browse Lace collections by category, occasion, and pattern
 * @page app/collections
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'

interface Collection {
  id: string
  name: string
  slug: string
  description: string
  image: string
  productCount: number
  featured?: boolean
  color?: string
}

// Collection categories
const collections: Collection[] = [
  {
    id: '1',
    name: 'Brocade Patterns',
    slug: 'brocade-patterns',
    description: 'Brocade with classic patterns passed down through generations',
    image: '/brocade-material-red-purple.jpeg',
    productCount: 24,
    featured: true,
    color: 'from-amber-500 to-amber-700',
  },
  {
    id: '2',
    name: 'Royal Collection',
    slug: 'royal-collection',
    description: 'Premium Two Toned lace featuring gold and intricate patterns for special occasions',
    image: '/royal-collection-lace.jpg',
    productCount: 18,
    featured: true,
    color: 'from-yellow-600 to-amber-800',
  },
  {
    id: '3',
    name: 'Wedding Collection',
    slug: 'wedding',
    description: 'Elegant pieces perfect for weddings, engagements, and celebrations',
    image: '/beaded-lace-style-purple.jpeg',
    productCount: 32,
    color: 'from-rose-500 to-pink-700',
  },
  {
    id: '4',
    name: 'Festival Wear',
    slug: 'festival',
    description: 'Vibrant and colorful Lace designs for festivals and cultural events',
    image: '/brocade-style-red.jpeg',
    productCount: 28,
    color: 'from-purple-500 to-purple-700',
  },
  {
    id: '5',
    name: 'Graduation Collection',
    slug: 'graduation',
    description: 'Sophisticated Lace stoles and sashes for academic ceremonies',
    image: '/brocade-style-blue.jpeg',
    productCount: 15,
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: '6',
    name: 'Modern Fusion',
    slug: 'modern-fusion',
    description: 'Contemporary designs blending traditional wear with modern aesthetics',
    image: '/modern-fusion-collection.jpg',
    productCount: 20,
    color: 'from-emerald-500 to-teal-700',
  },
  {
    id: '7',
    name: 'Limited Edition',
    slug: 'limited-edition',
    description: 'Exclusive, rare patterns available in limited quantities',
    image: '/embroided-lace-collection.jpeg',
    productCount: 8,
    featured: true,
    color: 'from-red-500 to-red-700',
  },
  {
    id: '8',
    name: 'Everyday Elegance',
    slug: 'everyday',
    description: 'Comfortable and stylish woven pieces for daily wear',
    image: '/two-toned-lace-style-pink-white-bg.png',
    productCount: 36,
    color: 'from-slate-500 to-slate-700',
  },
]

export default function CollectionsPage() {
  const featuredCollections = collections.filter((c) => c.featured)
  const regularCollections = collections.filter((c) => !c.featured)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/green-gold-beaded-lace.png"
              alt="Lace collections"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <TypewriterEffectSmooth 
              words={[
                { text: "Explore", className: "text-foreground font-display font-bold" },
                { text: "Our", className: "text-foreground font-display font-bold" },
                { text: "Collections", className: "bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent font-display font-bold" },
              ]}
              className="justify-start mb-6"
              cursorClassName="bg-primary"
            />
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8"
            >
              Discover authentic Lace fabric organized by tradition, occasion, and style.
              Each collection tells a unique story of Ghanaian heritage and craftsmanship.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 3.5 }}
              className="flex items-center gap-4 text-sm text-white/80"
            >
              <span>{collections.length} Collections</span>
              <span>•</span>
              <span>{collections.reduce((sum, c) => sum + c.productCount, 0)} Products</span>
            </motion.div>
          </div>
        </section>

        {/* Featured Collections */}
        {featuredCollections.length > 0 && (
          <section className="py-12 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Featured Collections
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Handpicked collections showcasing our finest Lace pieces
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCollections.map((collection, index) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    index={index}
                    featured
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Collections */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                All Collections
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Browse our complete range of collections
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularCollections.map((collection, index) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

/**
 * Collection Card Component
 */
function CollectionCard({
  collection,
  index,
  featured = false,
}: {
  collection: Collection
  index: number
  featured?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/shop?collection=${collection.slug}`}
        className="group block"
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300',
            featured ? 'aspect-[4/5]' : 'aspect-square'
          )}
        >
          {/* Image */}
          <div className={cn(
            "absolute inset-0",
            collection.slug === 'wedding' && "bg-white"
          )}>
            <Image
              src={collection.image}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            {/* Badge */}
            {collection.featured && (
              <Badge variant="gold" className="absolute top-4 right-4">
                <Star className="h-4 w-4" fill="currentColor" />
              </Badge>
            )}

            {/* Title */}
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
              {collection.name}
            </h3>

            {/* Description */}
            <p className="text-white/90 text-sm mb-3 line-clamp-2">
              {collection.description}
            </p>

            {/* Product Count */}
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">
                {collection.productCount} Products
              </span>
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
