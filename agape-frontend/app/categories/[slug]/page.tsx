"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProducts } from "@/lib/hooks/useProducts"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

// Hardcoded categories (replace with API call when backend supports it)
const CATEGORIES = [
  { name: "Lace", slug: "lace", description: "Traditional handwoven Lace fabrics" },
  { name: "Traditional Wear", slug: "traditional-wear", description: "Authentic African attire" },
  { name: "Accessories", slug: "accessories", description: "Complementary items for your wardrobe" },
]

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { data: productsData, isLoading } = useProducts({})

  // Find category
  const category = CATEGORIES.find((cat) => cat.slug === slug)

  if (!category) {
    notFound()
  }

  // Filter products by category (when backend supports category filtering)
  const categoryProducts = productsData?.products || []

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Header */}
          <div className="mb-12">
            <h1 className="font-serif text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">{category.description}</p>
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <p className="text-sm text-muted-foreground">Showing {categoryProducts.length} products</p>

            <div className="flex items-center gap-4">
              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No products found in this category yet.</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
