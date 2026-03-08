"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"

import { api } from "@/lib/api"
import type { Order, MenuItem } from "@/lib/types"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { ArrowLeft } from "lucide-react"

function OrderDetailContent() {

  const params = useParams()
  const router = useRouter()
  const orderId = Number(params.id)

  const [order, setOrder] = useState<Order | null>(null)
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  //////////////////////////////////////////////////
  // FETCH ORDER
  //////////////////////////////////////////////////

  useEffect(() => {

    const fetchOrder = async () => {

      try {

        const orders = await api.getMyOrders()

        const foundOrder = orders.find(
          (o) => o.id === orderId
        )

        if (foundOrder) {

          setOrder(foundOrder)

          const menuItems = await api.getMenuByCanteen(
            foundOrder.canteen.id
          )

          setMenu(menuItems)

        } else {

          setOrder(null)

        }

      } catch (error) {

        console.error("Failed to load order:", error)

      } finally {

        setLoading(false)

      }

    }

    if (orderId) {
      fetchOrder()
    }

  }, [orderId])

  //////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order...
      </div>
    )
  }

  //////////////////////////////////////////////////
  // NOT FOUND
  //////////////////////////////////////////////////

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Order not found
      </div>
    )
  }

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="min-h-screen bg-background">

      <Header />

      <main className="container py-10 max-w-2xl">

        <Button
          variant="ghost"
          onClick={() => router.push("/orders")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>

          <CardHeader className="flex flex-row items-center justify-between">

            <CardTitle>
              Order #{order.token}
            </CardTitle>

            <Badge>
              {order.status}
            </Badge>

          </CardHeader>

          <CardContent className="space-y-4">

            {order.items.map((item, index) => {

              const menuItem = menu.find(
                (mi) => mi.id === item.menu_item_id
              )

              return (

                <div
                  key={index}
                  className="flex justify-between"
                >

                  <p>
                    {item.quantity} × {menuItem?.name || "Item"}
                  </p>

                  <p>
                    ₹{(menuItem?.price || 0) * item.quantity}
                  </p>

                </div>

              )

            })}

            <Separator />

            <div className="flex justify-between font-semibold">

              <span>Total</span>

              <span>
                ₹{order.total_amount}
              </span>

            </div>

          </CardContent>

        </Card>

      </main>

    </div>

  )

}

export default function OrderDetailPage() {

  return (

    <ProtectedRoute allowedRoles={["student"]}>
      <OrderDetailContent />
    </ProtectedRoute>

  )

}