/**
 * Lazy Loading Utilities
 * Code splitting and lazy loading components
 * @module lib/performance/lazy-components
 */

'use client'

import * as React from 'react'
import { Skeleton } from '@/components/loading-skeleton'

/**
 * Lazy load component with custom fallback
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc)

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback || <Skeleton className="h-96 w-full" />}>
      <LazyComponent {...props} />
    </React.Suspense>
  )
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIntersecting] = React.useState(false)

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting)
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Lazy load component when it enters viewport
 */
export function LazyLoadOnView({
  children,
  fallback,
  rootMargin = '50px',
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref, {
    rootMargin,
    threshold: 0.1,
  })

  return (
    <div ref={ref}>
      {isVisible ? children : fallback || <Skeleton className="h-96 w-full" />}
    </div>
  )
}

/**
 * Prefetch link on hover
 */
export function usePrefetch(href: string) {
  const [isPrefetched, setIsPrefetched] = React.useState(false)

  const prefetch = React.useCallback(() => {
    if (isPrefetched) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
    
    setIsPrefetched(true)
  }, [href, isPrefetched])

  return { prefetch, isPrefetched }
}
