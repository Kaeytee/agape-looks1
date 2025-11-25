/**
 * Product Filters Panel Component
 * Provides filtering UI for products by price, color, tags, etc.
 * @module components/product-filters
 */

'use client'

import * as React from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn, formatCurrency } from '@/lib/utils'
import { ProductFilters as ProductFiltersType } from '@/lib/services/products.service'

// Filter options
const COLOR_OPTIONS = [
  { value: 'Gold', label: 'Gold', hex: '#C19A36' },
  { value: 'Blue', label: 'Blue', hex: '#1E40AF' },
  { value: 'Black', label: 'Black', hex: '#1A1A1A' },
  { value: 'Multicolor', label: 'Multicolor', hex: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)' },
]

const TAG_OPTIONS = [
  { value: 'Beaded Lush Lace', label: 'Beaded Lush Lace' },
  { value: 'Lush 3D Lace', label: 'Lush 3D Lace' },
  { value: 'Crystallized Luxury Lace', label: 'Crystallized Luxury Lace' },
  { value: 'Ivory Beaded Fringe Lace', label: 'Ivory Beaded Fringe Lace' },
  { value: 'Korean Beaded Lace', label: 'Korean Beaded Lace' },
  { value: 'Beaded Lace', label: 'Beaded Lace' },
  { value: 'Two Toned Lace', label: 'Two Toned Lace' },
  { value: 'Brocade', label: 'Brocade' },
  { value: 'Metallic Brocade', label: 'Metallic Brocade' },
  { value: 'Brads and Pearls', label: 'Brads and Pearls' },
]

interface ProductFiltersProps {
  filters: ProductFiltersType
  onFilterChange: (filters: ProductFiltersType) => void
  className?: string
}

/**
 * ProductFilters Component
 * Desktop: Sidebar panel, Mobile: Bottom drawer
 */
export function ProductFilters({ filters, onFilterChange, className }: ProductFiltersProps) {
  // Handle price range change from slider
  const handlePriceChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    })
  }

  // Handle custom min price input
  const handleMinPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : Number(e.target.value)
    onFilterChange({
      ...filters,
      minPrice: value,
    })
  }

  // Handle custom max price input
  const handleMaxPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? undefined : Number(e.target.value)
    onFilterChange({
      ...filters,
      maxPrice: value,
    })
  }

  // Handle color toggle
  const handleColorToggle = (color: string) => {
    const currentColors = filters.colors || []
    const newColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color]

    onFilterChange({ ...filters, colors: newColors })
  }

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]

    onFilterChange({ ...filters, tags: newTags })
  }

  // Handle stock toggle
  const handleStockToggle = (checked: boolean) => {
    onFilterChange({ ...filters, inStock: checked ? true : undefined })
  }

  // Clear all filters
  const handleClearAll = () => {
    onFilterChange({
      page: 1,
      limit: filters.limit,
    })
  }

  // Count active filters
  const activeFiltersCount =
    (filters.colors?.length || 0) +
    (filters.tags?.length || 0) +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0)

  // Filters UI content
  const filtersContent = (
    <div className="space-y-6">
      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
          </p>
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Price Range</Label>
        <div className="space-y-4">
          <Slider
            min={0}
            max={2000}
            step={50}
            value={[filters.minPrice || 0, filters.maxPrice || 2000]}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(filters.minPrice || 0)}</span>
            <span>{formatCurrency(filters.maxPrice || 2000)}</span>
          </div>

          {/* Custom Price Inputs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                max={filters.maxPrice || 2000}
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={handleMinPriceInput}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                min={filters.minPrice || 0}
                max="10000"
                placeholder="2000"
                value={filters.maxPrice || ''}
                onChange={handleMaxPriceInput}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Color</Label>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorToggle(color.value)}
              className={cn(
                'relative w-10 h-10 rounded-full border-2 transition-all hover:scale-110',
                filters.colors?.includes(color.value)
                  ? 'border-primary shadow-md'
                  : 'border-border'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.label}
            >
              {filters.colors?.includes(color.value) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tags/Categories */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Style & Occasion</Label>
        <div className="space-y-3">
          {TAG_OPTIONS.map((tag) => (
            <div key={tag.value} className="flex items-center space-x-2">
              <Checkbox
                id={tag.value}
                checked={filters.tags?.includes(tag.value)}
                onCheckedChange={() => handleTagToggle(tag.value)}
              />
              <Label
                htmlFor={tag.value}
                className="text-sm font-normal cursor-pointer"
              >
                {tag.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStock || false}
            onCheckedChange={handleStockToggle}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:block', className)}>
        <div className="sticky top-24 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          {filtersContent}
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your search by adjusting the filters below
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto h-[calc(85vh-120px)]">
              {filtersContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

/**
 * Applied Filters Chips Component
 * Shows active filters as removable chips
 */
interface AppliedFiltersProps {
  filters: ProductFiltersType
  onFilterChange: (filters: ProductFiltersType) => void
}

export function AppliedFilters({ filters, onFilterChange }: AppliedFiltersProps) {
  const removeColor = (color: string) => {
    onFilterChange({
      ...filters,
      colors: filters.colors?.filter((c) => c !== color),
    })
  }

  const removeTag = (tag: string) => {
    onFilterChange({
      ...filters,
      tags: filters.tags?.filter((t) => t !== tag),
    })
  }

  const removePriceRange = () => {
    onFilterChange({
      ...filters,
      minPrice: undefined,
      maxPrice: undefined,
    })
  }

  const removeStock = () => {
    onFilterChange({
      ...filters,
      inStock: undefined,
    })
  }

  const hasFilters =
    (filters.colors && filters.colors.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock

  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

      {/* Color chips */}
      {filters.colors?.map((color) => (
        <Badge key={color} variant="secondary" className="gap-1">
          {COLOR_OPTIONS.find((c) => c.value === color)?.label}
          <button onClick={() => removeColor(color)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Tag chips */}
      {filters.tags?.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1">
          {TAG_OPTIONS.find((t) => t.value === tag)?.label}
          <button onClick={() => removeTag(tag)}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Price range chip */}
      {(filters.minPrice || filters.maxPrice) && (
        <Badge variant="secondary" className="gap-1">
          {formatCurrency(filters.minPrice || 0)} - {formatCurrency(filters.maxPrice || 2000)}
          <button onClick={removePriceRange}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {/* Stock chip */}
      {filters.inStock && (
        <Badge variant="secondary" className="gap-1">
          In Stock
          <button onClick={removeStock}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  )
}
