"use client"

import * as React from "react"
import type { CartItem, Product } from "./types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, variantId?: string) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  subtotal: number
  itemCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  deliveryFee: number
  freeShippingThreshold: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isOpen, setIsOpen] = React.useState(false)
  const [deliveryFee, setDeliveryFee] = React.useState(50)
  const [freeShippingThreshold, setFreeShippingThreshold] = React.useState(500)

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem("agape-looks-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("[v0] Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Fetch settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        // We import dynamically to avoid circular dependencies if any, 
        // or just use the client directly. 
        // Since this is a client component, we can fetch from our API.
        // However, we don't have the useSettings hook available inside the provider easily 
        // without wrapping it in QueryClientProvider which is likely higher up.
        // But to be safe and simple, we can use fetch or the api client directly.

        // Let's use the api client directly
        const apiClient = (await import("@/lib/api/client")).default
        const response = await apiClient.get("/settings")
        const settings = response.data.data

        if (settings.delivery_fee?.value?.amount) {
          setDeliveryFee(Number(settings.delivery_fee.value.amount))
        }
        if (settings.free_shipping_threshold?.value?.amount) {
          setFreeShippingThreshold(Number(settings.free_shipping_threshold.value.amount))
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error)
      }
    }

    fetchSettings()
  }, [])

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("agape-looks-cart", JSON.stringify(items))
  }, [items])

  const addItem = React.useCallback((product: Product, quantity = 1, variantId?: string) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId,
      )

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...currentItems]
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        }
        return newItems
      } else {
        // Add new item
        return [
          ...currentItems,
          {
            productId: product.id,
            variantId,
            quantity,
            price: product.price,
          },
        ]
      }
    })
    setIsOpen(true)
  }, [])

  const removeItem = React.useCallback((productId: string, variantId?: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => !(item.productId === productId && item.variantId === variantId)),
    )
  }, [])

  const updateQuantity = React.useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId)
        return
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item,
        ),
      )
    },
    [removeItem],
  )

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const subtotal = React.useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const itemCount = React.useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  const openCart = React.useCallback(() => setIsOpen(true), [])
  const closeCart = React.useCallback(() => setIsOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        isOpen,
        openCart,
        closeCart,
        deliveryFee,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
