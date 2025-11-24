/**
 * Animated Button Component
 * Button with micro-interactions and animations
 * @module components/ui/animated-button
 */

'use client'

import * as React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends ButtonProps {
  loading?: boolean
  success?: boolean
  error?: boolean
  haptic?: boolean
}

/**
 * AnimatedButton Component
 * Button with loading, success, and error states
 */
export function AnimatedButton({
  children,
  loading = false,
  success = false,
  error = false,
  haptic = true,
  disabled,
  className,
  onClick,
  ...props
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    onClick?.(e)
  }

  return (
    <motion.div
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <Button
        {...props}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          'relative transition-all',
          success && 'bg-green-600 hover:bg-green-700',
          error && 'bg-red-600 hover:bg-red-700',
          className
        )}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        
        {success && !loading && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mr-2"
          >
            ✓
          </motion.span>
        )}
        
        {error && !loading && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mr-2"
          >
            ✕
          </motion.span>
        )}
        
        {children}
      </Button>
    </motion.div>
  )
}

/**
 * PulseButton Component
 * Button with pulsing animation
 */
export function PulseButton({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <Button {...props} className={className}>
        {children}
      </Button>
    </motion.div>
  )
}

/**
 * ShakeButton Component
 * Button that shakes on error
 */
export function ShakeButton({
  children,
  shake = false,
  className,
  ...props
}: ButtonProps & { shake?: boolean }) {
  return (
    <motion.div
      animate={
        shake
          ? {
              x: [0, -10, 10, -10, 10, 0],
            }
          : {}
      }
      transition={{ duration: 0.4 }}
    >
      <Button {...props} className={className}>
        {children}
      </Button>
    </motion.div>
  )
}

/**
 * SlideButton Component
 * Button with scaling animation on click
 */
export function SlideButton({
  children,
  icon,
  className,
  disabled,
  onClick,
  ...props
}: ButtonProps & { icon?: string | React.ReactNode }) {
  const [isClicked, setIsClicked] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)
      onClick?.(e)
    }
  }

  return (
    <motion.div
      animate={isClicked ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        {...props}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative bg-primary text-white border-0",
          "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </Button>
    </motion.div>
  )
}
