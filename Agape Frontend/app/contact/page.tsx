'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect"

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      setIsLoading(false)
    }, 1000)
  }

  const whatsappNumber = "0591599253"
  // Format for WhatsApp API: Country code (233) + number without leading 0
  const whatsappLink = `https://wa.me/233${whatsappNumber.substring(1)}`

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
              alt="Contact us"
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
                items={[{ label: 'Contact', href: '/contact' }]}
                className="mb-6"
              />
            </motion.div>

            <TypewriterEffectSmooth 
              words={[
                { text: "Get", className: "text-foreground font-display font-bold" },
                { text: "In", className: "text-foreground font-display font-bold" },
                { text: "Touch", className: "bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent font-display font-bold" },
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
              Have questions about our Lace fabric or need assistance with your order? We're here to help you find the
              perfect piece.
            </motion.p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1 space-y-8"
              >
                <div>
                  <h2 className="font-display text-2xl font-bold mb-6">Contact Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a
                          href="mailto:info@agapelooks.com"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          info@agapelooks.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">WhatsApp</h3>
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {whatsappNumber}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a href={`tel:${whatsappNumber}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {whatsappNumber}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Location</h3>
                        <p className="text-muted-foreground">
                          Accra, Ghana
                          <br />
                          West Africa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-border">
                  <h3 className="font-semibold mb-3">Business Hours</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">GMT (Ghana Mean Time)</p>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                {isSubmitted ? (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="font-display text-3xl font-bold mb-4">Message Sent Successfully!</h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      Thank you for contacting Agape looks. We've received your message and will respond within 24 hours.
                    </p>
                    <Button
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({ name: "", email: "", subject: "", message: "" })
                      }}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-8">
                    <h2 className="font-display text-2xl font-bold mb-6">Send Us a Message</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="How can we help you?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                        />
                      </div>

                      <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Contact CTA */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-4">Need Immediate Assistance?</h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Chat with us directly on WhatsApp for quick responses to your questions
              </p>
              <Button asChild size="lg" className="gap-2">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
