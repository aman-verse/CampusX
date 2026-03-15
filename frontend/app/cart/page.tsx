"use client"

import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

import {
  Minus,
  Plus,
  Trash2,
  Utensils,
  ShoppingCart
} from "lucide-react"

export default function CartPage() {

  const router = useRouter()

  const { user } = useAuth()

  const {
    items,
    canteenId,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal
  } = useCart()

  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [canteenName, setCanteenName] = useState("")
  const [placingOrder, setPlacingOrder] = useState(false)

  // autofill phone from dashboard
  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone)
    }
  }, [user])

  // fetch canteen name
  useEffect(() => {

    if (!canteenId) return

    const loadCanteen = async () => {

      try {

        const list = await api.getAllCanteens()

        const c = list.find(x => x.id === canteenId)

        if (c) setCanteenName(c.name)

      } catch (err) {
        console.error(err)
      }

    }

    loadCanteen()

  }, [canteenId])

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

      // if (res?.whatsapp_url) {
      //   window.open(res.whatsapp_url)
      // }

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

      <div className="min-h-screen flex flex-col items-center justify-center bg-background">

        <Utensils className="w-10 h-10 text-primary mb-4" />

        <p className="text-lg text-muted-foreground">
          Your cart is empty
        </p>

        <Button
          className="mt-4"
          onClick={() => router.push("/student")}
        >
          Browse Food
        </Button>

      </div>

    )

  }


  return (

    <div className="min-h-screen bg-background relative">

      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
        }}
      />

      <div className="relative z-10">


        {/* HEADER (same style as student page) */}

        <header className="sticky top-0 bg-background border-b border-border">

          <div className="container mx-auto h-16 flex justify-between items-center px-4">

            <div className="flex items-center gap-2">

              <Utensils className="w-6 h-6 text-primary" />

              <span className="font-semibold text-lg">
                Campus Eats
              </span>

            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {

                if (canteenId) {
                  router.push(`/canteen/${canteenId}`)
                } else {
                  router.push("/student")
                }

              }}
            >
              Back to Menu
            </Button>

          </div>

        </header>


        {/* CART */}

        <div className="container mx-auto p-6 max-w-xl">

          <Card>

            <CardHeader>

              <CardTitle>
                My Cart
              </CardTitle>

              {canteenName && (

                <p className="text-sm text-muted-foreground mt-1">
                  From {canteenName}
                </p>

              )}

            </CardHeader>

            <CardContent className="space-y-4">


              {items.map(item => (

                <div
                  key={item.menu_item_id}
                  className="flex justify-between items-center"
                >

                  <div>

                    <p className="font-medium">
                      {item.name}
                    </p>

                    <div className="text-sm text-muted-foreground flex gap-2">
                      <span>₹{item.price}</span>
                      <span>×</span>
                      <span>{item.quantity}</span>
                      <span>=</span>
                      <span className="font-medium text-foreground">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>

                  </div>


                  <div className="flex items-center gap-2">

                    <Button
                      size="icon"
                      onClick={() => {

                        if (item.quantity > 1) {

                          updateQuantity(
                            item.menu_item_id,
                            item.quantity - 1
                          )

                        }

                      }}
                    >
                      <Minus size={16} />
                    </Button>

                    <span>
                      {item.quantity}
                    </span>

                    <Button
                      size="icon"
                      onClick={() =>
                        updateQuantity(
                          item.menu_item_id,
                          item.quantity + 1
                        )
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

                <span>
                  Total
                </span>

                <span>
                  ₹{getTotal()}
                </span>

              </div>


              {/* PHONE */}

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
                    className="w-full border border-border rounded-lg px-3 py-2 mt-1 bg-background"
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
                    className="w-full border border-border rounded-lg px-3 py-2 mt-1 bg-background"
                  />

                </div>

              </div>


              <Button
                disabled={placingOrder || !phone || !address}
                className="w-full"
                onClick={placeOrder}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </Button>


            </CardContent>

          </Card>

        </div>


        {/* FOOTER (same as student page) */}

        <footer className="border-t border-border py-10 mt-10">

          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm">

            <div>
              <h3 className="font-semibold text-lg">Campus Eats</h3>
              <p className="text-muted-foreground mt-2">
                Order food from campus vendors easily and quickly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">About</h3>
              <p className="text-muted-foreground mt-2">
                A campus food ordering platform designed for students.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Contact</h3>
              <p className="text-muted-foreground mt-2">
                Founder: Aman Singh
              </p>
              <p className="text-muted-foreground">
                Email: contact@campuseats.com
              </p>
            </div>

          </div>

          <div className="text-center text-muted-foreground mt-8 text-sm">
            © {new Date().getFullYear()} Campus Eats
          </div>

        </footer>


      </div>

    </div>

  )

}