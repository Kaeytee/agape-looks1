/**
 * Screen Reader Utilities
 * Components for screen reader accessibility
 * @module components/accessibility/screen-reader-only
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ScreenReaderOnlyProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
}

/**
 * ScreenReaderOnly Component
 * Hides content visually but keeps it accessible to screen readers
 */
export function ScreenReaderOnly({
  children,
  as: Component = 'span',
  className,
}: ScreenReaderOnlyProps) {
  return (
    <Component
      className={cn(
        'sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        className
      )}
    >
      {children}
    </Component>
  )
}

/**
 * VisuallyHidden Component (Alias)
 */
export const VisuallyHidden = ScreenReaderOnly

/**
 * LiveRegion Component
 * ARIA live region for dynamic content announcements
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = true,
}: {
  children: React.ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  )
}

/**
 * SkipLink Component
 * Allows keyboard users to skip to main content
 */
export function SkipLink({ href = '#main-content' }: { href?: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      Skip to main content
    </a>
  )
}

/**
 * LoadingAnnouncement Component
 * Announces loading state to screen readers
 */
export function LoadingAnnouncement({ isLoading }: { isLoading: boolean }) {
  return (
    <LiveRegion>
      {isLoading ? 'Loading content, please wait' : ''}
    </LiveRegion>
  )
}
