"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Order, OrderStatus, Canteen, MenuItem } from "@/lib/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Utensils,
  LogOut,
  Loader2,
} from "lucide-react"

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  placed: {
    label: "Placed",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  accepted: {
    label: "Accepted",
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800",
    icon: <Truck className="h-4 w-4" />,
  },
}

export default function VendorPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [canteen, setCanteen] = useState<Canteen | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("placed")

  // Redirect if not authenticated or not a vendor
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "vendor")) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch vendor data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "vendor") return

      try {
        // Fetch all canteens and find the one belonging to this vendor
        const canteens = await api.getAllCanteens()
        const vendorCanteen = canteens.find(
          (c) => c.vendor_email === user.email
        )

        if (vendorCanteen) {
          setCanteen(vendorCanteen)
          // Fetch menu items for this canteen
          const menu = await api.getMenuByCanteen(vendorCanteen.id)
          setMenuItems(menu)
        }

        // Fetch vendor orders
        const ordersData = await api.getVendorOrders()
        setOrders(ordersData)
      } catch (error) {
        console.error("Failed to fetch vendor data:", error)
        toast({
          title: "Error",
          description: "Failed to load vendor data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.role === "vendor") {
      fetchData()
    }
  }, [isAuthenticated, user, toast])

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const updated = await api.acceptOrder(orderId)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      )
      toast({
        title: "Order Accepted",
        description: `Order #${orderId} has been accepted`,
      })
    } catch (error) {
      console.error("Failed to accept order:", error)
      toast({
        title: "Error",
        description: "Failed to accept order",
        variant: "destructive",
      })
    }
  }

  const handleRejectOrder = async (orderId: number) => {
    try {
      const updated = await api.rejectOrder(orderId)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      )
      toast({
        title: "Order Rejected",
        description: `Order #${orderId} has been rejected`,
      })
    } catch (error) {
      console.error("Failed to reject order:", error)
      toast({
        title: "Error",
        description: "Failed to reject order",
        variant: "destructive",
      })
    }
  }

  const handleDeliverOrder = async (orderId: number) => {
    try {
      const updated = await api.markOrderDelivered(orderId)
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      )
      toast({
        title: "Order Delivered",
        description: `Order #${orderId} has been marked as delivered`,
      })
    } catch (error) {
      console.error("Failed to deliver order:", error)
      toast({
        title: "Error",
        description: "Failed to mark order as delivered",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filterOrders = (status: string) => {
    if (status === "all") return orders
    return orders.filter((order) => order.status === status)
  }

  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find((m) => m.id === menuItemId)
    return item?.name || `Item #${menuItemId}`
  }

  const getMenuItemPrice = (menuItemId: number) => {
    const item = menuItems.find((m) => m.id === menuItemId)
    return item?.price || 0
  }

  const getOrderTotal = (order: Order) => {
    return order.items.reduce((total, item) => {
      return total + getMenuItemPrice(item.menu_item_id) * item.quantity
    }, 0)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const placedCount = orders.filter((o) => o.status === "placed").length
  const acceptedCount = orders.filter((o) => o.status === "accepted").length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Vendor Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Canteen Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{canteen?.name || "Your Canteen"}</CardTitle>
            <CardDescription>
              {canteen
                ? `Phone: ${canteen.vendor_phone}`
                : "Manage your orders"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <p className="text-2xl font-bold text-yellow-800">
                  {placedCount}
                </p>
                <p className="text-sm text-yellow-600">New Orders</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-800">
                  {acceptedCount}
                </p>
                <p className="text-sm text-blue-600">In Progress</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-50">
                <p className="text-2xl font-bold text-green-800">
                  {orders.filter((o) => o.status === "delivered").length}
                </p>
                <p className="text-sm text-green-600">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="placed">New ({placedCount})</TabsTrigger>
            <TabsTrigger value="accepted">In Progress ({acceptedCount})</TabsTrigger>
            <TabsTrigger value="all">All Orders</TabsTrigger>
          </TabsList>

          {["placed", "accepted", "all"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filterOrders(tab).length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No orders</h3>
                  <p className="text-muted-foreground mt-1">
                    {tab === "placed"
                      ? "No new orders at the moment"
                      : tab === "accepted"
                      ? "No orders in progress"
                      : "No orders yet"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filterOrders(tab).map((order) => {
                    const status = statusConfig[order.status]

                    return (
                      <Card key={order.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                Order #{order.id}
                              </CardTitle>
                              <CardDescription>
                                User #{order.user_id} • {formatDate(order.created_at)}
                              </CardDescription>
                            </div>
                            <Badge className={`${status.color} flex items-center gap-1`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x {getMenuItemName(item.menu_item_id)}
                                </span>
                                <span className="text-muted-foreground">
                                  Rs. {getMenuItemPrice(item.menu_item_id) * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t">
                            <p className="font-semibold">
                              Total: Rs. {getOrderTotal(order)}
                            </p>
                            <div className="flex gap-2">
                              {order.status === "placed" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectOrder(order.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAcceptOrder(order.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Accept
                                  </Button>
                                </>
                              )}
                              {order.status === "accepted" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleDeliverOrder(order.id)}
                                >
                                  <Truck className="w-4 h-4 mr-1" />
                                  Mark Delivered
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
