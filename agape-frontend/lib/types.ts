export interface Product {
  id: string
  sku: string
  title: string
  slug: string
  shortDescription: string
  fullStory: string
  price: number
  currency: string
  weaveOrigin: string
  careInstructions: string
  dimensions: {
    width?: number
    length?: number
    unit: "cm" | "inches"
  }
  tags: string[]
  variants: ProductVariant[]
  images: ProductImage[]
  inventory: number
  dispatchTime: string
  rating?: number
  reviewCount?: number
  isFeatured?: boolean
  isLimited?: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  name: string
  type: "color" | "size" | "pattern"
  value: string
  priceModifier?: number
  inventory: number
  image?: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  type: "main" | "detail" | "lifestyle" | "texture"
  order: number
}

export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  region: string
  postalCode?: string
  country: string
  notes?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled"
  items: CartItem[]
  shippingAddress: ShippingAddress
  subtotal: number
  discount: number
  shipping: number
  total: number
  paymentMethod: string
  paymentStatus: "pending" | "completed" | "failed"
  trackingNumber?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses: ShippingAddress[]
  orders: string[]
  wishlist: string[]
  createdAt: string
}
