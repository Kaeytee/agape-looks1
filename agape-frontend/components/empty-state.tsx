/**
 * Empty State Component
 * Displays friendly empty states for various scenarios
 * @module components/empty-state
 */

import * as React from 'react'
import { LucideIcon, ShoppingBag, Search, Package, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * EmptyState Component
 * Generic empty state with icon, title, description, and optional action
 */
export function EmptyState({
  icon: Icon = ShoppingBag,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      <div className="mb-4 p-4 rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}

      {/* Action Button */}
      {action && (
        <Button onClick={action.onClick} size="lg">
          {action.label}
        </Button>
      )}
    </div>
  )
}

/**
 * Preset empty states for common scenarios
 */

export function EmptyCart({ onShopClick }: { onShopClick: () => void }) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Discover our beautiful collection of handwoven Lace fabrics and start shopping"
      action={{
        label: 'Browse Products',
        onClick: onShopClick,
      }}
    />
  )
}

export function EmptySearchResults({ query, onClearSearch }: { query: string; onClearSearch: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find any products matching "${query}". Try different keywords or browse our categories.`}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  )
}

export function EmptyOrders({ onShopClick }: { onShopClick: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="No orders yet"
      description="You haven't placed any orders. Start shopping to see your orders here."
      action={{
        label: 'Start Shopping',
        onClick: onShopClick,
      }}
    />
  )
}

export function EmptyWishlist({ onShopClick }: { onShopClick: () => void }) {
  return (
    <EmptyState
      icon={Heart}
      title="Your wishlist is empty"
      description="Save your favorite Lace pieces to your wishlist for later"
      action={{
        label: 'Discover Products',
        onClick: onShopClick,
      }}
    />
  )
}

export function EmptyCategory({ categoryName, onShopClick }: { categoryName: string; onShopClick: () => void }) {
  return (
    <EmptyState
      icon={ShoppingBag}
      title={`No products in ${categoryName}`}
      description="Check back soon for new arrivals in this category"
      action={{
        label: 'Browse All Products',
        onClick: onShopClick,
      }}
    />
  )
}
