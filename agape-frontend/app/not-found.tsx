/**
 * 404 Not Found Page
 * Custom 404 error page with helpful navigation
 * @page app/not-found
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
          >
            {/* 404 Illustration */}
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                className="inline-block"
              >
                <div className="text-9xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                  404
                </div>
              </motion.div>
            </div>

            {/* Error Message */}
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/shop">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
            </div>

            {/* Helpful Links */}
            <div className="grid sm:grid-cols-3 gap-4 mt-12">
              <Link
                href="/shop"
                className="p-6 rounded-lg border border-border hover:shadow-card transition-shadow group"
              >
                <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-2">Shop</h3>
                <p className="text-sm text-muted-foreground">Browse our Lace collection</p>
              </Link>

              <Link
                href="/help"
                className="p-6 rounded-lg border border-border hover:shadow-card transition-shadow group"
              >
                <Search className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-2">Help Center</h3>
                <p className="text-sm text-muted-foreground">Find answers to your questions</p>
              </Link>

              <Link
                href="/contact"
                className="p-6 rounded-lg border border-border hover:shadow-card transition-shadow group"
              >
                <Home className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-2">Contact Us</h3>
                <p className="text-sm text-muted-foreground">Get in touch with our team</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
