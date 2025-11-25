/**
 * Breadcrumb Component
 * Displays navigation breadcrumbs for current page location
 * @module components/ui/breadcrumb
 */

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumb Component
 * Shows navigation path with links
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-2 text-sm', className)}>
      {/* Home Link */}
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {/* Separator */}
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            {/* Breadcrumb Item */}
            {isLast || !item.href ? (
              <span
                className={cn(
                  'font-medium truncate',
                  isLast ? 'text-foreground' : 'text-muted-foreground'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

/**
 * Breadcrumb with JSON-LD structured data for SEO
 */
export function BreadcrumbWithSchema({ items, className }: BreadcrumbProps) {
  // Generate JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${process.env.NEXT_PUBLIC_SITE_URL}${item.href}` : undefined,
    })),
  }

  return (
    <>
      {/* JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Breadcrumb Component */}
      <Breadcrumb items={items} className={className} />
    </>
  )
}
