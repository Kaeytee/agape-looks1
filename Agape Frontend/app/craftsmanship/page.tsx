/**
 * Craftsmanship Page
 * Showcases the art and tradition of Lace weaving with parallax effects
 * @page app/craftsmanship
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import DraggableCardDemo from '@/components/draggable-card-demo'
import { Sparkles, Heart, Award, Users, Clock, Globe } from 'lucide-react'
import Link from 'next/link'

export default function CraftsmanshipPage() {
  // Parallax scroll effects
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 1.1])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section with Parallax */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
          {/* Background Image with Parallax */}
          <motion.div
            style={{ y: y1, scale }}
            className="absolute inset-0 z-0"
          >
            <Image
              src="/ghanaian-weaver-making-kente-loom.jpg"
              alt="Artisan weaving Lace"
              fill
              className="object-cover opacity-20"
              priority
            />
          </motion.div>

          {/* Hero Content */}
          <motion.div
            style={{ y: y2, opacity }}
            className="container mx-auto px-4 z-10 text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Breadcrumb
                items={[{ label: 'Craftsmanship', href: '/craftsmanship' }]}
                className="mb-6 justify-center"
              />

              <TypewriterEffectSmooth
                words={[
                  { text: "The", className: "text-foreground font-display font-bold" },
                  { text: "Art", className: "text-foreground font-display font-bold" },
                  { text: "of", className: "text-foreground font-display font-bold" },
                  { text: "Lace", className: "bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent font-display font-bold" },
                ]}
                className="justify-center mb-6"
                cursorClassName="bg-primary"
              />
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
                A timeless tradition woven with precision, passion, and pride—each thread tells a story of Ghana's rich cultural heritage
              </p>
              <Button size="lg" asChild className="rounded-full">
                <Link href="/shop">Explore Our Collection</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* The Story Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                  A Royal Heritage
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Lace originated among the Ashanti Kingdom and is one of the most recognizable African textiles.
                  Each pattern and color carries deep symbolic meaning, representing everything from royalty and spiritual purity
                  to wealth and social status.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  Traditionally woven by skilled male weavers, Lace is created on horizontal treadle looms using intricate
                  patterns passed down through generations. The process requires exceptional skill, patience, and an intimate
                  knowledge of the symbolic language embedded in each design.
                </p>
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">300+ Years</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Of weaving tradition</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Master Weavers</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Skilled artisans</p>
                  </div>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src="/kente-traditional-loom.jpg"
                  alt="Traditional Lace loom"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Interactive Fabric Showcase */}
        <section className="py-20 md:py-32">
          <DraggableCardDemo />
        </section>

        {/* Symbolic Meanings Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
                Colors & Symbolism
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Every color in Lace carries profound meaning and cultural significance
              </p>
            </motion.div>

            {/* Color Meanings Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorMeanings.map((color, index) => (
                <motion.div
                  key={color.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div
                    className="w-full h-24 rounded-lg mb-4 shadow-inner"
                    style={{ backgroundColor: color.hex }}
                  />
                  <h3 className="font-semibold text-lg mb-2">{color.name}</h3>
                  <p className="text-sm text-muted-foreground">{color.meaning}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Commitment Section */}
        <section className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                  Our Commitment
                </h2>
                <p className="text-lg text-muted-foreground mb-12">
                  We work directly with master weavers in Ghana to ensure fair wages, preserve traditional techniques,
                  and support local communities. Every purchase helps sustain this ancient craft for future generations.
                </p>

                {/* Commitment Values */}
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  {commitmentValues.map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-12">
                  <Button size="lg" asChild className="rounded-full">
                    <Link href="/shop">Support Our Artisans</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// Process Steps Data
const processSteps = [
  {
    icon: Sparkles,
    title: '1. Thread Selection',
    description: 'Master weavers carefully select premium silk and cotton threads, each color chosen for its symbolic meaning.',
    image: '/kente-threads.jpg',
  },
  {
    icon: Heart,
    title: '2. Pattern Design',
    description: 'Traditional patterns are mapped out, each design carrying generations of cultural stories and significance.',
    image: '/kente-pattern-design.jpg',
  },
  {
    icon: Award,
    title: '3. Hand Weaving',
    description: 'Skilled artisans weave each strip by hand on traditional looms, a process requiring weeks of focused work.',
    image: '/ghanaian-weaver-making-kente-loom.jpg',
  },
]

// Color Meanings Data
const colorMeanings = [
  {
    name: 'Gold',
    hex: '#C19A36',
    meaning: 'Royalty, wealth, and spiritual purity',
  },
  {
    name: 'Red',
    hex: '#B03030',
    meaning: 'Sacrifice, bloodshed, and political passion',
  },
  {
    name: 'Green',
    hex: '#265E3E',
    meaning: 'Growth, harvest, and renewal of life',
  },
  {
    name: 'Blue',
    hex: '#1E40AF',
    meaning: 'Peace, harmony, and love',
  },
  {
    name: 'Black',
    hex: '#1A1A1A',
    meaning: 'Maturity, spiritual energy, and antiquity',
  },
  {
    name: 'White',
    hex: '#F5F5F5',
    meaning: 'Purity, cleansing, and festive occasions',
  },
]

// Commitment Values Data
const commitmentValues = [
  {
    icon: Heart,
    title: 'Fair Trade',
    description: 'Direct partnerships ensuring fair wages and working conditions for all artisans',
  },
  {
    icon: Globe,
    title: 'Cultural Preservation',
    description: 'Supporting traditional techniques and passing knowledge to new generations',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Investing in local communities through education and infrastructure',
  },
]
