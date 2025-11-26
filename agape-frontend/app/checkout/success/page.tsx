"use client"
import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, Mail, ArrowRight, Loader2, XCircle, AlertCircle } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { SITE_CONFIG } from "@/lib/constants"
import { formatCurrency } from "@/lib/utils"
import api from "@/lib/api/client"

interface PaymentVerifyResponse {
  paymentId: string
  orderId: string
  status: 'success' | 'already_processed' | 'failed'
  amount?: number
  paidAt?: string
  message?: string
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get("reference") || searchParams.get("trxref")
  
  const [isVerifying, setIsVerifying] = React.useState(true)
  const [verificationResult, setVerificationResult] = React.useState<PaymentVerifyResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [orderNumber, setOrderNumber] = React.useState<string | null>(null)

  // Verify payment on mount
  React.useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setError("No payment reference found. Please contact support.")
        setIsVerifying(false)
        return
      }

      try {
        console.log('[Success] Verifying payment...', { reference })
        const response = await api.get(`/payments/verify/${reference}`)
        const data = response.data.data || response.data
        
        console.log('[Success] Payment verified', data)
        setVerificationResult(data)
        
        // Fetch order details to get order number
        if (data.orderId) {
          try {
            const orderResponse = await api.get(`/orders/${data.orderId}`)
            const orderData = orderResponse.data.data?.order || orderResponse.data.data || orderResponse.data
            setOrderNumber(orderData.order_number || orderData.orderNumber || data.orderId)
          } catch (orderError) {
            console.warn('[Success] Could not fetch order details', orderError)
            setOrderNumber(data.orderId)
          }
        }
      } catch (err: any) {
        console.error('[Success] Payment verification failed', err)
        const message = err.response?.data?.message || err.message || "Payment verification failed"
        setError(message)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [reference])

  // Loading state
  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1 flex items-center justify-center py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
            <h1 className="font-display text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1 flex items-center justify-center py-16">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6">
              <XCircle className="h-10 w-10" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            
            <div className="bg-muted/50 border border-border rounded-(--radius-md) p-4 mb-8 text-left">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">What to do next:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Check your email for a payment confirmation from Paystack</li>
                    <li>If you were charged, please contact our support team</li>
                    <li>Reference: <code className="bg-muted px-1 rounded">{reference || 'N/A'}</code></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/checkout')}>
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, "")}?text=Hi, I need help with payment reference: ${reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // Success state
  const displayOrderNumber = orderNumber || verificationResult?.orderId || "N/A"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1 flex items-center justify-center py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {verificationResult?.status === 'already_processed' ? 'Order Already Confirmed!' : 'Order Confirmed!'}
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <div className="bg-muted/50 border border-border rounded-(--radius-md) p-6 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="font-display text-2xl font-bold">{displayOrderNumber}</p>
            {verificationResult?.amount && (
              <p className="text-sm text-muted-foreground mt-2">
                Amount Paid: <span className="font-semibold text-foreground">{formatCurrency(verificationResult.amount)}</span>
              </p>
            )}
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
                  href={`https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, "")}?text=Hi, I just placed order ${displayOrderNumber}`}
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
