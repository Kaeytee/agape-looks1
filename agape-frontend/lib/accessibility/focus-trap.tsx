/**
 * Focus Trap Hook
 * Traps focus within a component for accessibility (modals, drawers, etc.)
 * @module lib/accessibility/focus-trap
 */

'use client'

import * as React from 'react'

/**
 * useFocusTrap Hook
 * Manages focus within a container
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element on mount
    firstElement?.focus()

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab - moving backwards
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        // Tab - moving forwards
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }, [isActive])

  return containerRef
}

/**
 * useKeyboardShortcut Hook
 * Handles keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  } = {}
) {
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const { ctrlKey = false, shiftKey = false, altKey = false } = options

      if (
        e.key === key &&
        e.ctrlKey === ctrlKey &&
        e.shiftKey === shiftKey &&
        e.altKey === altKey
      ) {
        e.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [key, callback, options])
}

/**
 * useEscapeKey Hook
 * Handles Escape key press
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
  React.useEffect(() => {
    if (!isActive) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [callback, isActive])
}
