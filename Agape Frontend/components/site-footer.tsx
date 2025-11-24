import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SITE_CONFIG } from "@/lib/constants"

const footerLinks = {
  shop: [
    { name: "All Products", href: "/shop" },
    { name: "Collections", href: "/collections" },
    { name: "New Arrivals", href: "/shop?filter=new" },
    { name: "Limited Edition", href: "/shop?filter=limited" },
  ],
  about: [
    { name: "Our Story", href: "/about" },
    { name: "Craftsmanship", href: "/craftsmanship" },
    { name: "The Weavers", href: "/weavers" },
    { name: "Sustainability", href: "/sustainability" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "Shipping & Returns", href: "/shipping" },
    { name: "Size Guide", href: "/size-guide" },
    { name: "Care Instructions", href: "/care" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Authenticity", href: "/authenticity" },
  ],
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-primary/20 bg-gradient-to-br from-secondary/5 via-background to-accent/5 overflow-hidden">
      {/* Decorative background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">{SITE_CONFIG.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Authentic Lace fabric and garments, handwoven by skilled Ghanaian artisans. Each piece tells a story of
              heritage, craftsmanship, and cultural pride.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Get 5% off your first order</h3>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-xs"
                  aria-label="Email for newsletter"
                />
                <Button type="submit" variant="default">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About links */}
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Trust badges */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Secure Payment
              </span>
              <span>Handwoven in Ghana</span>
              <span>Authentic Guarantee</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <a href="https://www.instagram.com/agapelooks_fabrics?igsh=dGRxM2NxbHN3YXF0" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Copyright and legal */}
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <div className="flex gap-4">
              {footerLinks.legal.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
