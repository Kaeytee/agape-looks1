/**
 * Wishlist Context
 * Global state management for user wishlist with backend sync
 * @module lib/contexts/wishlist-context
 */

'use client'

import * as React from 'react'
import { Product } from '../types'
import { wishlistService } from '../services/wishlist.service'
import { toast } from 'sonner'

interface WishlistContextType {
  items: Product[]
  itemCount: number
  isLoading: boolean
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined)

/**
 * Wishlist Provider Component
 * Manages wishlist state and syncs with backend
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load wishlist on mount
  React.useEffect(() => {
    const loadWishlist = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token')
        
        if (token) {
          // Load from backend
          const data = await wishlistService.getWishlist()
          setItems(data?.items || [])
        } else {
          // Load from localStorage for guest users
          const savedWishlist = localStorage.getItem('wishlist')
          if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist)
            setItems(Array.isArray(parsed) ? parsed : [])
          } else {
            setItems([])
          }
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error)
        // Fallback to localStorage
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
          try {
            const parsed = JSON.parse(savedWishlist)
            setItems(Array.isArray(parsed) ? parsed : [])
          } catch (e) {
            setItems([])
          }
        } else {
          setItems([])
        }
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    loadWishlist()
  }, [])

  // Save to localStorage whenever items change (for guest users)
  React.useEffect(() => {
    if (isInitialized) {
      const token = localStorage.getItem('token')
      if (!token) {
        localStorage.setItem('wishlist', JSON.stringify(items))
      }
    }
  }, [items, isInitialized])

  /**
   * Add product to wishlist
   */
  const addToWishlist = async (product: Product) => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Add to backend
        await wishlistService.addToWishlist(product.id)
      }
      
      // Add to local state
      setItems((prev) => {
        if (prev.some((item) => item.id === product.id)) {
          return prev
        }
        return [...prev, product]
      })
      
      toast.success('Added to wishlist', {
        description: product.title,
      })
    } catch (error: any) {
      toast.error('Failed to add to wishlist', {
        description: error.response?.data?.message || 'Please try again',
      })
    }
  }

  /**
   * Remove product from wishlist
   */
  const removeFromWishlist = async (productId: string) => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Remove from backend
        await wishlistService.removeFromWishlist(productId)
      }
      
      // Remove from local state
      setItems((prev) => prev.filter((item) => item.id !== productId))
      
      toast.success('Removed from wishlist')
    } catch (error: any) {
      toast.error('Failed to remove from wishlist', {
        description: error.response?.data?.message || 'Please try again',
      })
    }
  }

  /**
   * Check if product is in wishlist
   */
  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.id === productId)
  }

  /**
   * Clear entire wishlist
   */
  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (token) {
        // Clear from backend
        await wishlistService.clearWishlist()
      }
      
      // Clear local state
      setItems([])
      
      toast.success('Wishlist cleared')
    } catch (error: any) {
      toast.error('Failed to clear wishlist', {
        description: error.response?.data?.message || 'Please try again',
      })
    }
  }

  /**
   * Refresh wishlist from backend
   */
  const refreshWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const data = await wishlistService.getWishlist()
        setItems(data?.items || [])
      }
    } catch (error) {
      console.error('Failed to refresh wishlist:', error)
      setItems([])
    }
  }

  const value: WishlistContextType = {
    items: items || [],
    itemCount: items?.length || 0,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    refreshWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

/**
 * Hook to use wishlist context
 */
export function useWishlist() {
  const context = React.useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
