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
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isOpen, setIsOpen] = React.useState(false)

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
