"use client"

import { useEffect, useState, JSX } from "react"
import Link from "next/link"

import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"

import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { Package, Clock, CheckCircle, XCircle } from "lucide-react"

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: JSX.Element }
> = {
  placed: {
    label: "Placed",
    variant: "secondary",
    icon: <Clock className="h-4 w-4" />,
  },
  accepted: {
    label: "Accepted",
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    variant: "outline",
    icon: <Package className="h-4 w-4" />,
  },
}

function OrdersContent() {

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"active" | "past">("active")

  useEffect(() => {

    const fetchOrders = async () => {

      try {

        const data = await api.getMyOrders()
        setOrders(data)

      } catch (e) {

        console.error("Failed to fetch orders", e)

      } finally {

        setLoading(false)

      }

    }

    fetchOrders()

  }, [])

  //////////////////////////////////////////////////
  // FILTER
  //////////////////////////////////////////////////

  const activeOrders = orders.filter(
    o => o.status !== "delivered" && o.status !== "rejected"
  )

  const pastOrders = orders.filter(
    o => o.status === "delivered" || o.status === "rejected"
  )

  //////////////////////////////////////////////////
  // FORMAT TIME
  //////////////////////////////////////////////////

  const formatDate = (d: string) => {

    const date = new Date(d + "Z")

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  }

  //////////////////////////////////////////////////
  // ORDER CARD
  //////////////////////////////////////////////////

  const OrderCard = ({ order }: { order: Order }) => {

    const status = statusMap[order.status]

    return (

      <Link href={`/orders/${order.id}`}>

        <Card className="hover:shadow-2xl transition cursor-pointer
        bg-white/0 backdrop-blur-md border border-white/30">

          <CardHeader className="pb-2">

            <div className="flex justify-between items-start">

              <div className="space-y-1">

                <CardTitle className="text-lg font-bold">
                  Order #{order.token}
                </CardTitle>

                <p className="text-sm font-medium text-muted-foreground">
                  {order.canteen?.name}
                </p>

                <CardDescription className="text-xs">
                  {formatDate(order.created_at)}
                </CardDescription>

              </div>

              <Badge
                variant={status.variant}
                className="flex gap-1 items-center"
              >
                {status.icon}
                {status.label}
              </Badge>

            </div>

          </CardHeader>

          <CardContent className="pt-1 space-y-1">

            {order.items.map((item: any, i: number) => (

              <p
                key={i}
                className="text-sm text-muted-foreground"
              >
                {item.quantity} × {item.menu_item?.name}
              </p>

            ))}

            <div className="pt-2">

              <p className="text-sm font-semibold">
                Total ₹{order.total_amount}
              </p>

            </div>

          </CardContent>

        </Card>

      </Link>

    )

  }

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////

  return (

    <div className="min-h-screen bg-background relative">

      {/* Background Image */}

      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-sm"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
        }}
      />

      <div className="relative z-10">

        <Header />

        <main className="container mx-auto py-10">

          <div className="max-w-xl mx-auto space-y-8">

            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold">
                My Orders
              </h1>

              <p className="text-muted-foreground text-sm">
                Track your campus food orders
              </p>

            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>

              <TabsList className="max-w-xl mx-auto">

                <TabsTrigger value="active">
                  Active ({activeOrders.length})
                </TabsTrigger>

                <TabsTrigger value="past">
                  Past ({pastOrders.length})
                </TabsTrigger>

              </TabsList>

              <TabsContent value="active" className="mt-6">

                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : activeOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No active orders
                  </p>
                ) : (

                  <div className="space-y-6">
                    {activeOrders.map(o => (
                      <OrderCard key={o.id} order={o} />
                    ))}
                  </div>

                )}

              </TabsContent>

              <TabsContent value="past" className="mt-6">

                {loading ? (
                  <Skeleton className="h-32 w-full" />
                ) : pastOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No past orders
                  </p>
                ) : (

                  <div className="space-y-6">
                    {pastOrders.map(o => (
                      <OrderCard key={o.id} order={o} />
                    ))}
                  </div>

                )}

              </TabsContent>

            </Tabs>

          </div>

        </main>

      </div>

    </div>

  )

}

export default function OrdersPage() {

  return (

    <ProtectedRoute allowedRoles={["student"]}>
      <OrdersContent />
    </ProtectedRoute>

  )

}