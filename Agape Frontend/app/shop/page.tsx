/**
 * Shop Page
 * Main product browsing page with filters, search, and pagination
 * @page app/shop
 */

'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { ProductGridSkeleton } from '@/components/loading-skeleton'
import { ProductFilters, AppliedFilters } from '@/components/product-filters'
import { Pagination } from '@/components/ui/pagination'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { EmptySearchResults, EmptyCategory } from '@/components/empty-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProducts } from '@/lib/hooks/useProducts'
import { ProductFilters as ProductFiltersType } from '@/lib/services/products.service'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'

export default function ShopPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL params
  const [filters, setFilters] = React.useState<ProductFiltersType>(() => ({
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
    sort: (searchParams.get('sort') as any) || 'relevance',
    minPrice: Number(searchParams.get('minPrice')) || undefined,
    maxPrice: Number(searchParams.get('maxPrice')) || undefined,
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
    inStock: searchParams.get('inStock') === 'true' || undefined,
  }))

  // Fetch products with filters
  const { data: productsData, isLoading, error } = useProducts(filters)

  const products = productsData?.products || []
  const totalPages = productsData?.totalPages || 1
  const totalProducts = productsData?.total || 0

  // Update URL when filters change
  React.useEffect(() => {
    const params = new URLSearchParams()

    if (filters.page && filters.page > 1) params.set('page', filters.page.toString())
    if (filters.sort && filters.sort !== 'relevance') params.set('sort', filters.sort)
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.colors?.length) params.set('colors', filters.colors.join(','))
    if (filters.tags?.length) params.set('tags', filters.tags.join(','))
    if (filters.inStock) params.set('inStock', 'true')

    const queryString = params.toString()
    router.push(`/shop${queryString ? `?${queryString}` : ''}`, { scroll: false })
  }, [filters, router])

  // Handle filter changes
  const handleFilterChange = (newFilters: ProductFiltersType) => {
    setFilters({ ...newFilters, page: 1 }) // Reset to page 1 on filter change
  }

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setFilters({ ...filters, sort: sort as any, page: 1 })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-background">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/shop-page-background.jpeg"
              alt="Lace fabric collection"
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>

          {/* Hero Content */}
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Breadcrumb
                items={[{ label: 'Shop', href: '/shop' }]}
                className="mb-6"
              />
            </motion.div>

            <TypewriterEffectSmooth 
              words={[
                { text: "Shop", className: "text-foreground font-display font-bold" },
                { text: "Authentic", className: "text-foreground font-display font-bold" },
                { text: "Garments", className: "bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent font-display font-bold" },
              ]}
              className="justify-start mb-6"
              cursorClassName="bg-primary"
            />
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8"
            >
              Browse our collection of handwoven Lace fabric and garments, each piece crafted with tradition and care
            </motion.p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              className="lg:w-64 flex-shrink-0"
            />

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Loading...' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''}`}
                  </p>

                  {/* Sort Dropdown */}
                  <Select value={filters.sort || 'relevance'} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Applied Filters */}
                <AppliedFilters filters={filters} onFilterChange={handleFilterChange} />
              </div>

              {/* Products */}
              {isLoading && <ProductGridSkeleton count={12} />}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">Failed to load products</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && products.length === 0 && (
                <EmptySearchResults
                  query={searchParams.get('q') || 'your search'}
                  onClearSearch={() => handleFilterChange({ page: 1, limit: 12 })}
                />
              )}

              {/* Products Grid */}
              {!isLoading && !error && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={filters.page || 1}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="mt-12"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
