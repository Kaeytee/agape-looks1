'use client'

import * as React from 'react'
import Image from "next/image"
import Link from "next/link"
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from "@/components/ui/button"
import { Heart, Users, Award, Globe } from "lucide-react"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/shop-page-background.jpeg"
              alt="Artisan weaving Lace fabric"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Breadcrumb
                items={[{ label: 'About', href: '/about' }]}
                className="mb-6"
              />
            </motion.div>

            <TypewriterEffectSmooth 
              words={[
                { text: "Celebrating", className: "text-foreground font-display font-bold" },
                { text: "Life's", className: "text-foreground font-display font-bold" },
                { text: "Special", className: "text-foreground font-display font-bold" },
                { text: "Moments", className: "bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent font-display font-bold" },
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
              Your one-stop destination for high-quality brocade and luxurious lace fabrics in Accra, Ghana
            </motion.p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Story
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg max-w-none space-y-6 text-muted-foreground leading-relaxed"
            >
              <p>
                At AgapeLooks, we are passionate about helping you celebrate life's special moments in style. Based in Accra, Ghana, we specialize in high-quality brocade and luxurious lace fabrics adorned with beautiful beads and crystals.
              </p>

              <p>
                Whether you are searching for the perfect wedding gown fabric, a stunning wedding guest outfit, or coordinating "asoebi" for your bridal party, we are your one-stop destination.
              </p>

              <p>
                Our mission is to provide stylish women with the perfect foundation for their most elegant looks.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We meticulously select only the finest brocade and lace fabrics, ensuring exceptional durability and beauty
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Elegance</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our collections are curated to provide the perfect foundation for sophisticated and timeless looks
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Celebration</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We are passionate about helping you shine during life's most important and memorable special moments
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-3">Customer Focus</h3>
                <p className="text-muted-foreground leading-relaxed">
                  From wedding guests to bridal parties, we are dedicated to helping every woman find her perfect match
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Artisan Partnership */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Curated Excellence</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We meticulously source our fabrics to ensure only the highest quality reaches our customers. From intricate
                    beadwork to shimmering crystals, every yard of lace and brocade in our collection is selected for its
                    exceptional beauty and craftsmanship.
                  </p>
                  <p>
                    Understanding the importance of your special day, we prioritize fabrics that not only look stunning but
                    also feel luxurious against your skin. Our collection features a diverse range of textures, patterns,
                    and colors to suit every style and occasion.
                  </p>
                  <p>
                    When you choose AgapeLooks, you're choosing a partner in your style journey. We are dedicated to
                    providing you with the finest materials that serve as the perfect canvas for your dream outfit, ensuring
                    you shine on your most memorable days.
                  </p>
                </div>
              </div>

              <div className="relative h-[600px] rounded-lg overflow-hidden">
                <Image
                  src="/orange-lace-dress.jpg"
                  alt="Model wearing stunning orange beaded lace dress"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">Experience Authentic Lace</h2>
            <p className="text-lg mb-8 text-primary-foreground/90 leading-relaxed max-w-3xl">
              Explore our collection of handwoven Lace fabric and garments, each piece a testament to centuries of
              tradition and artistry
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/shop">Shop Collection</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
