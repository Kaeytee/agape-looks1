/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals for performance optimization
 * @module lib/performance/web-vitals
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  })

  // Example: Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    })
  }

  // Example: Send to custom analytics endpoint
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body)
  } else {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
    })
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric)
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  // Cumulative Layout Shift
  onCLS(sendToAnalytics)
  
  // First Input Delay
  onFID(sendToAnalytics)
  
  // First Contentful Paint
  onFCP(sendToAnalytics)
  
  // Largest Contentful Paint
  onLCP(sendToAnalytics)
  
  // Time to First Byte
  onTTFB(sendToAnalytics)
}

/**
 * Performance observer for custom metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private marks: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Mark start of a performance measurement
   */
  mark(name: string): void {
    this.marks.set(name, performance.now())
    performance.mark(name)
  }

  /**
   * Measure time since mark
   */
  measure(name: string, startMark: string): number {
    const startTime = this.marks.get(startMark)
    if (!startTime) {
      console.warn(`No mark found for ${startMark}`)
      return 0
    }

    const duration = performance.now() - startTime
    performance.measure(name, startMark)

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  /**
   * Log component render time
   */
  logRender(componentName: string, duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Render] ${componentName}: ${duration.toFixed(2)}ms`)
    }

    // Send to analytics if duration is significant
    if (duration > 100) {
      fetch('/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify({
          type: 'component_render',
          component: componentName,
          duration,
        }),
        keepalive: true,
      })
    }
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance()
  const startTime = performance.now()

  return {
    /**
     * Log render complete
     */
    logRender: () => {
      const duration = performance.now() - startTime
      monitor.logRender(componentName, duration)
    },
    
    /**
     * Mark custom event
     */
    mark: (eventName: string) => {
      monitor.mark(`${componentName}:${eventName}`)
    },
    
    /**
     * Measure custom event
     */
    measure: (eventName: string, startMark: string) => {
      return monitor.measure(`${componentName}:${eventName}`, startMark)
    },
  }
}

// Global type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
