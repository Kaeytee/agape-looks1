/**
 * Help & FAQ Page
 * Comprehensive help center with searchable FAQs and contact options
 * @page app/help
 */

'use client'

import * as React from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Search, MessageCircle, Mail, Phone, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')

  // Filter FAQs based on search and category
  const filteredFaqs = React.useMemo(() => {
    let filtered = faqCategories

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((cat) => cat.id === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.map((category) => ({
        ...category,
        faqs: category.faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((cat) => cat.faqs.length > 0)
    }

    return filtered
  }, [searchQuery, activeCategory])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Breadcrumb
              items={[{ label: 'Help Center', href: '/help' }]}
              className="mb-4"
            />

            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              Find answers to common questions or get in touch with our support team
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base"
              />
            </div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={method.href}
                    className="block p-6 rounded-lg border border-border bg-card hover:shadow-card transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{method.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {method.description}
                        </p>
                        <span className="text-sm font-medium text-primary group-hover:underline">
                          {method.action} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveCategory('all')}
                className="flex-shrink-0"
              >
                All Topics
              </Button>
              {faqCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(category.id)}
                  className="flex-shrink-0"
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or browse all topics
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredFaqs.map((category) => (
                    <div key={category.id}>
                      <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category.id}-${index}`}
                            className="border border-border rounded-lg px-6 bg-card"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <span className="font-medium">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground pb-4">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
              <p className="text-muted-foreground mb-8">
                Our support team is here to assist you with any questions or concerns
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link href="/contact">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contact Support
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/shop">
                    Browse Products
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

// Contact Methods Data
const contactMethods = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start chat',
    href: '#chat',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    action: 'Send email',
    href: 'mailto:support@agape.com',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Mon-Fri, 9AM-5PM GMT',
    action: 'Call us',
    href: 'tel:+233123456789',
  },
]

// FAQ Categories and Questions
const faqCategories = [
  {
    id: 'orders',
    title: 'Orders & Shipping',
    faqs: [
      {
        question: 'How long does shipping take?',
        answer: 'Domestic orders within Ghana typically arrive within 3-5 business days. International shipping varies by destination but generally takes 7-14 business days. Express shipping options are available at checkout.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. You can see exact shipping options and costs during checkout.',
      },
      {
        question: 'Can I track my order?',
        answer: 'Absolutely. Once your order ships, you\'ll receive a tracking number via email. You can also track your order status from your account dashboard.',
      },
      {
        question: 'What if my order is delayed?',
        answer: 'If your order is delayed beyond the estimated delivery date, please contact our support team. We\'ll investigate and provide you with an update within 24 hours.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Products & Care',
    faqs: [
      {
        question: 'Are your Lace fabrics authentic?',
        answer: 'Yes, all our Lace fabrics are 100% authentic, handwoven by skilled artisans in Ghana. Each piece comes with a certificate of authenticity.',
      },
      {
        question: 'How do I care for my Lace fabric?',
        answer: 'Hand wash in cold water with mild detergent. Do not bleach. Hang dry away from direct sunlight. Iron on low heat if needed. For detailed care instructions, check the care card included with your purchase.',
      },
      {
        question: 'Can I request custom patterns?',
        answer: 'Yes! We offer custom Lace weaving services. Please contact us with your requirements, and we\'ll provide a quote and timeline. Custom orders typically take 4-8 weeks.',
      },
      {
        question: 'What is the difference between silk and cotton Lace?',
        answer: 'Silk Lace has a luxurious sheen and drape, traditionally used for special occasions. Cotton Lace is more durable and suitable for everyday wear. Both are authentic and of premium quality.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days of delivery for unworn, unwashed items in original condition with tags attached. Custom orders and sale items are final sale.',
      },
      {
        question: 'How do I return an item?',
        answer: 'Log into your account, go to Order History, select the order, and click "Request Return". Follow the instructions to print your return label. We\'ll process your refund within 5-7 business days of receiving the return.',
      },
      {
        question: 'Can I exchange an item?',
        answer: 'Yes, exchanges are welcome within 30 days. Please return the original item and place a new order for the desired item to ensure availability.',
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'For defective items or shipping errors, we cover return shipping. For other returns, customers are responsible for return shipping costs.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment & Security',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), mobile money (MTN, Vodafone, AirtelTigo), and bank transfers via Paystack.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard SSL encryption and never store your full payment details. All transactions are processed securely through Paystack.',
      },
      {
        question: 'Can I save my payment method?',
        answer: 'Yes, you can securely save your payment information in your account for faster checkout. Your card details are tokenized and encrypted.',
      },
      {
        question: 'Do you offer payment plans?',
        answer: 'For orders over GHS 1000, we offer installment payment options. Select "Pay in Installments" at checkout to see available plans.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Orders',
    faqs: [
      {
        question: 'Do I need an account to place an order?',
        answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and earn rewards points.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'Please contact us immediately if you need to modify your order. If it hasn\'t shipped yet, we\'ll do our best to accommodate changes.',
      },
      {
        question: 'How do I cancel my order?',
        answer: 'You can cancel unshipped orders from your account dashboard. Once shipped, please follow our return process.',
      },
    ],
  },
]
