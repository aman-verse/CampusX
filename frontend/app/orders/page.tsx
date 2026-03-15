"use client"

import { useEffect, useState, JSX } from "react"
import { useRouter } from "next/navigation"

import { ProtectedRoute } from "@/components/protected-route"

import { api } from "@/lib/api"
import type { Order } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  ShoppingCart,
  LayoutDashboard,
  User,
  LogOut
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"

import {
  Avatar,
  AvatarFallback
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

//////////////////////////////////////////////////

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: JSX.Element }
> = {

  placed: {
    label: "Waiting",
    variant: "secondary",
    icon: <Clock className="h-4 w-4" />
  },

  accepted: {
    label: "Preparing",
    variant: "default",
    icon: <CheckCircle className="h-4 w-4" />
  },

  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="h-4 w-4" />
  },

  delivered: {
    label: "Delivered",
    variant: "outline",
    icon: <Package className="h-4 w-4" />
  }

}

//////////////////////////////////////////////////

function OrdersContent() {

  const router = useRouter()

  const { user, logout } = useAuth()
  const { clearCart, getItemCount } = useCart()

  const [orders, setOrders] = useState<Order[]>([])
  const [tab, setTab] = useState<
    "placed" | "accepted" | "rejected" | "delivered"
  >("placed")

  const [range, setRange] = useState("week")

  const [autoSwitch, setAutoSwitch] = useState(true)

  //////////////////////////////////////////////////
  // INSTANT CACHE LOAD

  useEffect(() => {

    const cached = localStorage.getItem("orders_cache")

    if (cached) {

      const data = JSON.parse(cached)

      let filtered = data

      if (range === "week") {

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        filtered = data.filter(
          (o: Order) => new Date(o.created_at) > weekAgo
        )

      }

      setOrders(filtered)

    }

    fetchOrders()

  }, [range])

  //////////////////////////////////////////////////

  const fetchOrders = async () => {

    try {

      const data = await api.getMyOrders()

      localStorage.setItem(
        "orders_cache",
        JSON.stringify(data)
      )

      let filtered = data

      if (range === "week") {

        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)

        filtered = data.filter(
          o => new Date(o.created_at) > weekAgo
        )

      }

      setOrders(filtered)

    } catch (e) {

      console.error(e)

    }

  }

  //////////////////////////////////////////////////

  useEffect(() => {

    const interval = setInterval(fetchOrders, 3000)

    return () => clearInterval(interval)

  }, [range])

  //////////////////////////////////////////////////

  const placedOrders = orders.filter(o => o.status === "placed")
  const acceptedOrders = orders.filter(o => o.status === "accepted")
  const rejectedOrders = orders.filter(o => o.status === "rejected")
  const deliveredOrders = orders.filter(o => o.status === "delivered")

  //////////////////////////////////////////////////
  // AUTO TAB SWITCH (only if user hasn't clicked manually)

  useEffect(() => {

    if (!autoSwitch) return

    if (placedOrders.length > 0) {

      setTab("placed")

    } else if (acceptedOrders.length > 0) {

      setTab("accepted")

    } else if (rejectedOrders.length > 0) {

      setTab("rejected")

    } else {

      setTab("delivered")

    }

  }, [orders, autoSwitch])

  //////////////////////////////////////////////////

  const formatDate = (d: string) => {

    const date = new Date(d + "Z")

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })

  }

  //////////////////////////////////////////////////

  const OrderCard = ({ order }: { order: Order }) => {

    const status = statusMap[order.status]

    return (

      <Card
        className="hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer
bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-white/20"
      >

        <CardHeader className="pb-2">

          <div className="flex justify-between items-start">

            <div className="space-y-1">

              <CardTitle className="text-lg font-bold">
                Order #{order.token}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {order.canteen?.name}
              </p>

              <CardDescription className="text-xs">
                {formatDate(order.created_at)}
              </CardDescription>

            </div>

            <Badge variant={status.variant}
              className="flex gap-1 items-center">

              {status.icon}
              {status.label}

            </Badge>

          </div>

        </CardHeader>

        <CardContent className="pt-1 space-y-1">

          {order.items.map((item: any, i: number) => (

            <p key={i} className="text-sm text-muted-foreground">

              {item.quantity} × {item.menu_item?.name}
              {" = ₹"}
              {item.menu_item?.price * item.quantity}

            </p>

          ))}

          {order.status === "rejected" && (order as any).reject_reason && (

            <p className="text-xs text-red-500">
              Reason: {(order as any).reject_reason}
            </p>

          )}

          <p className="font-semibold pt-2">
            Total ₹{order.total_amount}
          </p>

        </CardContent>

      </Card>

    )

  }

  //////////////////////////////////////////////////

  return (

    <div className="min-h-screen bg-background relative">

      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')"
        }}
      />

      <div className="relative z-10">

        {/* HEADER */}

        <header className="sticky top-0 bg-background border-b border-border">

          <div className="container mx-auto h-16 flex justify-between items-center px-4">

            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">
                Campus Eats
              </span>
            </div>

            <div className="flex items-center gap-3">

              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => router.push("/orders")}
              >
                Orders
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => router.push("/cart")}
              >
                <ShoppingCart />

                {getItemCount() > 0 && (
                  <Badge className="ml-1">
                    {getItemCount()}
                  </Badge>
                )}

              </Button>

              <DropdownMenu>

                <DropdownMenuTrigger asChild>

                  <Avatar className="cursor-pointer">

                    <AvatarFallback>
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>

                  </Avatar>

                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">

                  <div className="px-3 py-2">

                    <p className="font-medium">
                      {user?.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>

                    <Badge className="mt-1">
                      {user?.role}
                    </Badge>

                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/student")}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/orders")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      logout()
                      clearCart()
                      router.push("/login")
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>

            </div>

          </div>

        </header>

        {/* FILTER */}

        <div className="text-center mt-6">

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded px-3 py-1
bg-background border-border text-foreground
cursor-pointer"
          >

            <option value="week">
              Last 7 Days
            </option>

            <option value="all">
              All Orders
            </option>

          </select>

        </div>

        {/* ORDERS */}

        <main className="container mx-auto py-10">

          <div className="max-w-xl mx-auto space-y-8">

            <Tabs
              value={tab}
              onValueChange={(v) => {
                setAutoSwitch(false)
                setTab(v as any)
              }}
              className="cursor-pointer"
            >

              <TabsList className="max-w-xl mx-auto">

                <TabsTrigger value="placed" className="cursor-pointer">
                  Waiting ({placedOrders.length})
                </TabsTrigger>

                <TabsTrigger value="accepted" className="cursor-pointer">
                  Preparing ({acceptedOrders.length})
                </TabsTrigger>

                <TabsTrigger value="rejected" className="cursor-pointer">
                  Rejected ({rejectedOrders.length})
                </TabsTrigger>

                <TabsTrigger value="delivered" className="cursor-pointer">
                  Delivered ({deliveredOrders.length})
                </TabsTrigger>

              </TabsList>

              <TabsContent value="placed">
                <div className="space-y-6">
                  {placedOrders.map(o => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="accepted">
                <div className="space-y-6">
                  {acceptedOrders.map(o => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rejected">
                <div className="space-y-6">
                  {rejectedOrders.map(o => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="delivered">
                <div className="space-y-6">
                  {deliveredOrders.map(o => (
                    <OrderCard key={o.id} order={o} />
                  ))}
                </div>
              </TabsContent>

            </Tabs>

          </div>

        </main>

      </div>

    </div>

  )

}

//////////////////////////////////////////////////

export default function OrdersPage() {

  return (

    <ProtectedRoute allowedRoles={["student"]}>
      <OrdersContent />
    </ProtectedRoute>

  )

}