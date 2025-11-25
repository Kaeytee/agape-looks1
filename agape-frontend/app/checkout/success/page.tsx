"use client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/constants"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order") || "AGW-XXXXXXXX"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Order Confirmed!</h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-muted/50 border border-border rounded-(--radius-md) p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="font-display text-2xl font-bold">{orderNumber}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="flex gap-4 p-4 border border-border rounded-md">
              <Mail className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Confirmation Email</p>
                <p className="text-sm text-muted-foreground">We've sent a confirmation email with your order details</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 border border-border rounded-md">
              <Package className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Track Your Order</p>
                <p className="text-sm text-muted-foreground">You'll receive tracking information once shipped</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/account/orders">
                View Order Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href="/shop">Continue Shopping</Link>
              </Button>

              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, "")}?text=Hi, I just placed order ${orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Need help with your order?</p>
            <p className="text-sm">
              Contact us at{" "}
              <a href="mailto:support@agapelooks.com" className="text-primary hover:underline">
                support@agapelooks.com
              </a>{" "}
              or via WhatsApp
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
