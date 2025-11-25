/**
 * Search Bar Component with Autocomplete
 * Provides instant product search with debounced input and dropdown results
 * @module components/search-bar
 */

'use client'

import * as React from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProductSearch } from '@/lib/hooks/useProducts'
import { Product } from '@/lib/types'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface SearchBarProps {
  className?: string
  autoFocus?: boolean
  onClose?: () => void
}

/**
 * SearchBar Component
 * Displays search input with live autocomplete results
 */
export function SearchBar({ className, autoFocus = false, onClose }: SearchBarProps) {
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fetch search results
  const { data: results = [], isLoading } = useProductSearch(debouncedQuery)

  // Handle input focus
  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown when query exists and results available
  React.useEffect(() => {
    setIsOpen(query.length > 0)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query) {
      handleSearch()
    }
    if (e.key === 'Escape') {
      setQuery('')
      setIsOpen(false)
      onClose?.()
    }
  }

  // Handle search submission
  const handleSearch = () => {
    if (query) {
      router.push(`/shop?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      onClose?.()
    }
  }

  // Handle result click
  const handleResultClick = () => {
    setQuery('')
    setIsOpen(false)
    onClose?.()
  }

  return (
    <div ref={searchRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search for Lace patterns, colors, or styles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => setQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-xl border border-border/50 backdrop-blur-md overflow-hidden z-50"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">Searching...</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length > 2 && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No products found for &quot;{query}&quot;</p>
                <p className="text-sm text-muted-foreground">Try different keywords</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading && results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-2">
                  <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Products
                  </p>
                  {results.slice(0, 6).map((product: Product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        <Image
                          src={product.images[0]?.url || '/placeholder.jpg'}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.weaveOrigin}</p>
                      </div>

                      {/* Price */}
                      <div className="text-sm font-semibold text-primary">
                        {formatCurrency(product.price)}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Results */}
                {results.length > 6 && (
                  <div className="border-t border-border p-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={handleSearch}
                    >
                      <span>View all {results.length} results</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Tip */}
            {query.length > 0 && query.length <= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 3 characters to search
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
