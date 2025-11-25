/**
 * SEO Metadata Utilities
 * Helper functions for generating page metadata
 * @module lib/seo/metadata
 */

import type { Metadata } from 'next'

const SITE_NAME = 'Agape looks'
const SITE_DESCRIPTION = 'Premium Lace fabric and garments. Authentic patterns crafted by Ghanaian weavers. Luxury ethnic elegance meets modern design.'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agapelooks.com'
const TWITTER_HANDLE = '@agapelooks'

interface PageMetadataOptions {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  canonical?: string
}

/**
 * Generate page metadata
 */
export function generatePageMetadata({
  title,
  description = SITE_DESCRIPTION,
  keywords = [],
  image = `${SITE_URL}/og-image.jpg`,
  type = 'website',
  noIndex = false,
  canonical,
}: PageMetadataOptions): Metadata {
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [...keywords, 'Lace', 'African fabric', 'Ghanaian textiles', 'handwoven'],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonical || undefined,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: TWITTER_HANDLE,
      images: [image],
    },
    robots: noIndex
      ? {
        index: false,
        follow: false,
      }
      : {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
  }

  return metadata
}

/**
 * Generate product metadata
 */
export function generateProductMetadata({
  name,
  description,
  price,
  currency = 'GHS',
  image,
  availability = 'in stock',
}: {
  name: string
  description: string
  price: number
  currency?: string
  image: string
  availability?: string
}): Metadata {
  return generatePageMetadata({
    title: name,
    description,
    image,
    type: 'product',
    keywords: [name, 'Lace', 'African textile', 'handwoven fabric'],
  })
}

/**
 * Generate JSON-LD structured data for organization
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      'https://facebook.com/agapelooks',
      'https://www.instagram.com/agapelooks_fabrics?igsh=dGRxM2NxbHN3YXF0',
      'https://twitter.com/agapelooks',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+233-24-123-4567',
      contactType: 'Customer Service',
      email: 'support@agapelooks.com',
      availableLanguage: ['English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Independence Avenue',
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
  }
}

/**
 * Generate JSON-LD structured data for product
 */
export function generateProductSchema({
  name,
  description,
  image,
  price,
  currency = 'GHS',
  availability = 'InStock',
  sku,
  brand = SITE_NAME,
  rating,
  reviewCount,
}: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  availability?: string
  sku?: string
  brand?: string
  rating?: number
  reviewCount?: number
}) {
  const product: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: SITE_URL,
      priceCurrency: currency,
      price,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  }

  if (sku) {
    product.sku = sku
  }

  if (rating && reviewCount) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
    }
  }

  return product
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
