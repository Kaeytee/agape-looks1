"use client"

import type React from "react"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Link from "next/link"
import { useProduct } from "@/lib/hooks/useProducts"
import { AdminRouteGuard } from "@/components/admin-route-guard"

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  // Fetch product by ID from API
  const { data: product, isLoading: loadingProduct } = useProduct(id)

  const [formData, setFormData] = useState({
    name: product?.title || "",
    description: product?.fullStory || "",
    price: product?.price || 0,
    category: product?.category || "",
    stock: product?.inventory || 0,
    width: product?.dimensions?.width || "",
    length: product?.dimensions?.length || "",
    weight: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      router.push("/admin/products")
    }, 1000)
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      // Simulate delete
      router.push("/admin/products")
    }
  }

  if (!product) {
    return (
      <AdminRouteGuard>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-3xl font-bold mb-4">Product Not Found</h1>
            <Button asChild>
              <Link href="/admin/products">Back to Products</Link>
            </Button>
          </div>
        </div>
      </AdminRouteGuard>
    )
  }

  return (
    <AdminRouteGuard>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/admin/products"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Products
            </Link>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-serif text-4xl font-bold mb-2">Edit Product</h1>
                <p className="text-muted-foreground">Update product information and inventory</p>
              </div>

              <Button variant="destructive" onClick={handleDelete} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-2xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (GH₵)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lace Fabric">Lace Fabric</SelectItem>
                        <SelectItem value="Lace Stoles">Lace Stoles</SelectItem>
                        <SelectItem value="Lace Garments">Lace Garments</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-2xl font-bold mb-6">Inventory</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (inches)</Label>
                    <Input
                      id="width"
                      name="width"
                      type="number"
                      step="0.1"
                      value={formData.width}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Length (yards)</Label>
                    <Input
                      id="length"
                      name="length"
                      type="number"
                      step="0.1"
                      value={formData.length}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminRouteGuard>
  )
}
