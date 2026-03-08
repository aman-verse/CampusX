"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"

import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

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

  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {

    const fetchOrder = async () => {

      const data = await api.getMyOrders()
      const order = data.find((o) => String(o.id) === orderId)
      setOrder(order || null)

    }

    fetchOrder()

  }, [orderId])


  if (!order) {

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    )

  }

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

          <CardHeader>

            <CardTitle>
              Order #{String(order.id).slice(0, 6)}
            </CardTitle>

            <Badge>
              {order.status}
            </Badge>

          </CardHeader>

          <CardContent className="space-y-4">

            {order.items.map((item, index) => (

              <div
                key={index}
                className="flex justify-between"
              >

                <p>
                  {item.quantity}x {item.item_name}
                </p>

                <p>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>

              </div>

            ))}

            <Separator />

            <div className="flex justify-between font-semibold">

              <span>Total</span>

              <span>
                ₹{order.total_amount.toFixed(2)}
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