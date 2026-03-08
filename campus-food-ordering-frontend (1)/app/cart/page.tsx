"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { Minus, Plus, Trash2 } from "lucide-react"

export default function CartPage() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [placingOrder, setPlacingOrder] = useState(false)
  const {
    items,
    canteenId,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal
  } = useCart()

  const placeOrder = async () => {
    if (placingOrder) return
    if (!canteenId || items.length === 0) return
    if (!phone || !address) {
      alert("Phone number and address are required")
      return
    }

    try {
      setPlacingOrder(true)
      const res = await api.createOrder({
        canteen_id: canteenId,
        phone: phone,
        address: address,
        items: items.map(i => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity
        }))
      })

      if (res?.whatsapp_url) {
        window.open(res.whatsapp_url)
      }

      clearCart()

      router.push("/orders")

    } catch (err) {

      console.error(err)
      alert("Order failed")

    } finally {

      setPlacingOrder(false)

    }

  }

  if (items.length === 0) {

    return (
      <div className="p-10 text-center text-lg">
        Cart is empty
      </div>
    )

  }

  return (

    <div className="container mx-auto p-6 max-w-xl">

      <Card>

        <CardHeader>
          <CardTitle>My Cart</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {items.map(item => (

            <div
              key={item.menu_item_id}
              className="flex justify-between items-center"
            >

              <div>
                <p className="font-medium">{item.name}</p>

                <p className="text-sm text-muted-foreground">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-2">

                <Button
                  size="icon"
                  onClick={() => {
                    if (item.quantity > 1) {
                      updateQuantity(item.menu_item_id, item.quantity - 1)
                    }
                  }}
                >
                  <Minus size={16} />
                </Button>

                <span>{item.quantity}</span>

                <Button
                  size="icon"
                  onClick={() =>
                    updateQuantity(item.menu_item_id, item.quantity + 1)
                  }
                >
                  <Plus size={16} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    removeItem(item.menu_item_id)
                  }
                >
                  <Trash2 size={16} />
                </Button>

              </div>

            </div>

          ))}

          <Separator />

          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{getTotal()}</span>
          </div>

          {/* Phone + Address */}

          <div className="space-y-4 mt-6">

            <div>

              <label className="text-sm font-medium">
                Phone Number *
              </label>

              <input
                type="tel"
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10 digit phone"
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />

            </div>

            <div>

              <label className="text-sm font-medium">
                Address *
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Hostel 6 Room 213"
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />

            </div>

          </div>

          <Button
            disabled={placingOrder || !phone || !address}
            className="w-full bg-orange-500 hover:bg-orange-600"
            onClick={placeOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </Button>

        </CardContent>

      </Card>

    </div>

  )

}