/**
 * Pagination Component
 * Provides page navigation for lists
 * @module components/ui/pagination
 */

import * as React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPageNumbers?: boolean
  maxPageButtons?: number
}

/**
 * Pagination Component
 * Desktop: Full page numbers, Mobile: Simplified navigation
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  maxPageButtons = 7,
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const leftSiblingIndex = Math.max(currentPage - 1, 1)
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages)

    const showLeftDots = leftSiblingIndex > 2
    const showRightDots = rightSiblingIndex < totalPages - 1

    // Always show first page
    pages.push(1)

    if (showLeftDots) {
      pages.push('...')
    } else if (leftSiblingIndex === 2) {
      pages.push(2)
    }

    // Show pages around current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    if (showRightDots) {
      pages.push('...')
    } else if (rightSiblingIndex === totalPages - 1) {
      pages.push(totalPages - 1)
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Handlers
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers - Desktop */}
      {showPageNumbers && (
        <div className="hidden md:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div
                  key={`dots-${index}`}
                  className="h-9 w-9 flex items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'default' : 'outline'}
                size="icon"
                onClick={() => handlePageClick(pageNumber)}
                aria-label={`Go to page ${pageNumber}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'h-9 w-9',
                  isActive && 'pointer-events-none'
                )}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>
      )}

      {/* Page Info - Mobile */}
      <div className="md:hidden flex items-center px-3 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

/**
 * Simple Pagination Component (Load More style)
 */
interface SimplePaginationProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  className?: string
}

export function SimplePagination({ hasMore, isLoading, onLoadMore, className }: SimplePaginationProps) {
  if (!hasMore) {
    return null
  }

  return (
    <div className={cn('flex justify-center', className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </Button>
    </div>
  )
}
