/**
 * Sitemap Generation
 * Generates XML sitemap for SEO
 * @file app/sitemap.ts
 */

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agapelooks.com'

/**
 * Generate sitemap
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/collections',
    '/about',
    '/craftsmanship',
    '/contact',
    '/help',
    '/track',
    '/wishlist',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Add dynamic product routes
  // Fetch from API in production
  const productRoutes: MetadataRoute.Sitemap = []

  // TODO: Add dynamic collection routes
  const collectionRoutes: MetadataRoute.Sitemap = []

  return [...staticRoutes, ...productRoutes, ...collectionRoutes]
}
