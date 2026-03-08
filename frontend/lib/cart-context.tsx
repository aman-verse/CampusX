"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { CartItem, MenuItem } from "./types"

interface CartContextType {
  items: CartItem[]
  canteenId: number | null
  addItem: (item: MenuItem) => void
  removeItem: (menuItemId: number) => void
  updateQuantity: (menuItemId: number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [canteenId, setCanteenId] = useState<number | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      const savedCanteenId = localStorage.getItem("cart_canteen_id")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch {
          // Invalid cart data
        }
      }
      if (savedCanteenId) {
        setCanteenId(Number(savedCanteenId))
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))
      if (canteenId) {
        localStorage.setItem("cart_canteen_id", String(canteenId))
      } else {
        localStorage.removeItem("cart_canteen_id")
      }
    }
  }, [items, canteenId])

  const addItem = useCallback(
    (item: MenuItem) => {
      // If adding from a different canteen, clear cart first
      if (canteenId && canteenId !== item.canteen_id) {
        const confirmed = window.confirm(
          "Adding items from a different canteen will clear your cart. Continue?"
        )
        if (!confirmed) return
        setItems([])
      }

      setCanteenId(item.canteen_id)

      setItems((prev) => {
        const existing = prev.find((i) => i.menu_item_id === item.id)
        if (existing) {
          return prev.map((i) =>
            i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        return [
          ...prev,
          {
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            canteen_id: item.canteen_id,
          },
        ]
      })
    },
    [canteenId]
  )

  const removeItem = useCallback((menuItemId: number) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.menu_item_id !== menuItemId)
      if (newItems.length === 0) {
        setCanteenId(null)
      }
      return newItems
    })
  }, [])

  const updateQuantity = useCallback(
    (menuItemId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(menuItemId)
        return
      }
      setItems((prev) =>
        prev.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity } : i))
      )
    },
    [removeItem]
  )

  const clearCart = useCallback(() => {
    setItems([])
    setCanteenId(null)
  }, [])

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        canteenId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
