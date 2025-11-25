/**
 * Luxury Homepage
 * Brand experience focused on heritage, craftsmanship, and storytelling
 * @page app/
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroParallax } from '@/components/ui/hero-parallax'
import { ArrowRight } from 'lucide-react'

// Collection products for parallax hero - using unique collection images
const collectionProducts = [
  {
    title: "Brocade Patterns",
    link: "/shop?collection=brocade-patterns",
    thumbnail: "/brocade-material-red-purple.jpeg",
  },
  {
    title: "Royal Collection",
    link: "/shop?collection=royal-collection",
    thumbnail: "/royal-collection-lace.jpg",
  },
  {
    title: "Wedding Collection",
    link: "/shop?collection=wedding",
    thumbnail: "/beaded-lace-style-purple.jpeg",
  },
  {
    title: "Festival Wear",
    link: "/shop?collection=festival",
    thumbnail: "/brocade-style-red.jpeg",
  },
  {
    title: "Graduation Collection",
    link: "/shop?collection=graduation",
    thumbnail: "/brocade-style-blue.jpeg",
  },
  {
    title: "Modern Fusion",
    link: "/shop?collection=modern-fusion",
    thumbnail: "/modern-fusion-collection.jpg",
  },
  {
    title: "Limited Edition",
    link: "/shop?collection=limited-edition",
    thumbnail: "/embroided-lace-collection.jpeg",
  },
  {
    title: "Beaded Lace Gold",
    link: "/shop",
    thumbnail: "/beaded-lace-material-gold.jpeg",
  },
  {
    title: "Two Toned Pink",
    link: "/shop",
    thumbnail: "/two-toned-lace-style-pink.jpeg",
  },
  {
    title: "Beaded Black Lace",
    link: "/shop",
    thumbnail: "/beaded-lace-material-black.jpeg",
  },
  {
    title: "Brocade Green",
    link: "/shop",
    thumbnail: "/brocade-style-green.jpeg",
  },
  {
    title: "Champagne Brocade",
    link: "/shop",
    thumbnail: "/champagne-brocade-style-brown.jpeg",
  },
  {
    title: "Purple Brocade",
    link: "/shop",
    thumbnail: "/brocade-style-purple.jpeg",
  },
  {
    title: "Beaded Lace Purple",
    link: "/shop",
    thumbnail: "/beaded-lace-material-purple.jpeg",
  },
  {
    title: "Green Gold Beaded",
    link: "/shop",
    thumbnail: "/green-gold-beaded-lace.png",
  },
]

export default function HomePage() {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <main id="main-content" className="flex-1">
          {/* Hero Parallax Section */}
          <HeroParallax products={collectionProducts} />

          {/* Featured Collections */}
          <section className="relative py-24 md:py-32 bg-gradient-to-b from-accent/5 via-background to-secondary/5 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
                >
                  Collections
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                  className="font-display text-4xl md:text-5xl font-light"
                >
                  Curated for distinction
                </motion.h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    name: 'Royal Collection',
                    image: '/royal-collection-lace.jpg',
                    slug: 'royal-collection',
                  },
                  {
                    name: 'Wedding Collection',
                    image: '/beaded-lace-style-purple.jpeg',
                    slug: 'wedding',
                  },
                  {
                    name: 'Limited Edition',
                    image: '/embroided-lace-collection.jpeg',
                    slug: 'limited-edition',
                  },
                ].map((collection, index) => (
                  <motion.div
                    key={collection.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link
                      href={`/shop?collection=${collection.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <h3 className="font-display text-2xl font-light group-hover:text-primary transition-colors">
                        {collection.name}
                      </h3>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors group"
                >
                  <span className="font-medium">View all collections</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>

          {/* Craftsmanship Section */}
          <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-1/4 left-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative aspect-square rounded-2xl overflow-hidden order-2 lg:order-1"
                >
                  <Image
                    src="/beaded-lace-material-gold.jpeg"
                    alt="Intricate lace detail"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-6 order-1 lg:order-2"
                >
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Craftsmanship
                  </p>
                  <h2 className="font-display text-4xl md:text-5xl font-light leading-tight">
                    Hours become heirlooms
                  </h2>
                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      Each piece of our Lace requires countless hours at the loom, where weavers employ
                      techniques passed down through generations. The rhythm of the shuttle, the
                      precision of each thread—this is mastery in motion.
                    </p>
                    <p>
                      What emerges is not merely fabric, but wearable art that honors both the weaver's
                      skill and the wearer's appreciation for authentic luxury.
                    </p>
                  </div>
                  <Link
                    href="/craftsmanship"
                    className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group mt-8"
                  >
                    <span className="font-medium">Explore the process</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </>
  )
}
