"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Upload } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { AdminRouteGuard } from "@/components/admin-route-guard"

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: "",
    sku: "",
    price: "",
    currency: "GHS",
    shortDescription: "",
    fullStory: "",
    weaveOrigin: "",
    careInstructions: "",
    width: "",
    length: "",
    unit: "cm",
    inventory: "",
    dispatchTime: "2-4 business days",
    isFeatured: false,
    isLimited: false,
    tags: [] as string[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    toast({
      title: "Product created",
      description: "Your product has been added successfully.",
    })
    router.push("/admin/products")
  }

  return (
    <AdminRouteGuard>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />

        <main id="main-content" className="flex-1 bg-muted/30">
          <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
            <Button variant="ghost" size="sm" className="mb-6" asChild>
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Add New Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Product Title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Royal Asante Lace"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g., KNT-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({ ...formData, currency: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GHS">GHS</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description *</Label>
                    <Input
                      id="shortDescription"
                      required
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      placeholder="Brief description for product cards"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullStory">Full Story *</Label>
                    <Textarea
                      id="fullStory"
                      required
                      value={formData.fullStory}
                      onChange={(e) => setFormData({ ...formData, fullStory: e.target.value })}
                      placeholder="Detailed product story and cultural significance"
                      rows={5}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                  <CardDescription>Specifications and care information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weaveOrigin">Weave Origin *</Label>
                    <Input
                      id="weaveOrigin"
                      required
                      value={formData.weaveOrigin}
                      onChange={(e) => setFormData({ ...formData, weaveOrigin: e.target.value })}
                      placeholder="e.g., Bonwire, Ashanti Region"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        placeholder="200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        value={formData.length}
                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                        placeholder="300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="inches">inches</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careInstructions">Care Instructions</Label>
                    <Textarea
                      id="careInstructions"
                      value={formData.careInstructions}
                      onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                      placeholder="How to care for this product"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Shipping</CardTitle>
                  <CardDescription>Stock and delivery information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inventory">Stock Quantity *</Label>
                      <Input
                        id="inventory"
                        type="number"
                        required
                        value={formData.inventory}
                        onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dispatchTime">Dispatch Time</Label>
                      <Input
                        id="dispatchTime"
                        value={formData.dispatchTime}
                        onChange={(e) => setFormData({ ...formData, dispatchTime: e.target.value })}
                        placeholder="2-4 business days"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                      />
                      <Label htmlFor="isFeatured" className="cursor-pointer">
                        Featured Product
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isLimited"
                        checked={formData.isLimited}
                        onCheckedChange={(checked) => setFormData({ ...formData, isLimited: checked as boolean })}
                      />
                      <Label htmlFor="isLimited" className="cursor-pointer">
                        Limited Edition
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload product photos (main, detail, texture, lifestyle)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">Drag and drop images here, or click to browse</p>
                    <Button type="button" variant="outline" size="sm">
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? "Creating..." : "Create Product"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/products">Cancel</Link>
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AdminRouteGuard>
  )
}
