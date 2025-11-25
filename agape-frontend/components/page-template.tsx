/**
 * Page Template Component
 * Provides consistent page structure with SEO and accessibility
 * @module components/page-template
 */

'use client'

import * as React from 'react'
import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { PageTransition } from './page-transition'
import { Breadcrumb } from './ui/breadcrumb'
import Head from 'next/head'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageTemplateProps {
  children: React.ReactNode
  title?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  headerClassName?: string
  mainClassName?: string
  showBreadcrumbs?: boolean
  transition?: 'default' | 'fade' | 'slide' | 'scale' | 'none'
}

/**
 * PageTemplate Component
 * Standard page wrapper with header, footer, and content area
 */
export function PageTemplate({
  children,
  title,
  description,
  breadcrumbs,
  headerClassName = '',
  mainClassName = '',
  showBreadcrumbs = true,
  transition = 'default',
}: PageTemplateProps) {
  // Render content with or without transition
  const renderContent = () => {
    if (transition === 'none') {
      return children
    }

    return <PageTransition>{children}</PageTransition>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className={`flex-1 ${mainClassName}`}>
        {/* Page Header with Breadcrumbs */}
        {(title || breadcrumbs) && (
          <section className={`border-b border-border bg-muted/30 ${headerClassName}`}>
            <div className="container mx-auto px-4 py-8 md:py-12">
              {breadcrumbs && showBreadcrumbs && (
                <Breadcrumb items={breadcrumbs} className="mb-4" />
              )}
              
              {title && (
                <div>
                  <h1 className="font-display text-3xl md:text-5xl font-bold mb-2">
                    {title}
                  </h1>
                  {description && (
                    <p className="text-lg text-muted-foreground max-w-3xl">
                      {description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Page Content */}
        {renderContent()}
      </main>

      <SiteFooter />
    </div>
  )
}

/**
 * Simple Page Template (No header section)
 */
export function SimplePageTemplate({
  children,
  mainClassName = '',
  transition = 'default',
}: {
  children: React.ReactNode
  mainClassName?: string
  transition?: 'default' | 'fade' | 'slide' | 'scale' | 'none'
}) {
  const renderContent = () => {
    if (transition === 'none') {
      return children
    }

    return <PageTransition>{children}</PageTransition>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main-content" className={`flex-1 ${mainClassName}`}>
        {renderContent()}
      </main>
      <SiteFooter />
    </div>
  )
}
