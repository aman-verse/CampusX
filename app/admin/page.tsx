"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type { Order, User, OrderStatus, College, Canteen } from "@/lib/types"
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
  Users,
  Store,
  Utensils,
  LogOut,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  GraduationCap,
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

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()

  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [colleges, setColleges] = useState<College[]>([])
  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch admin data
  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== "admin") return

      try {
        const [ordersData, usersData, collegesData, canteensData] =
          await Promise.all([
            api.getAllOrders(),
            api.getAllUsers(),
            api.getColleges(),
            api.getAllCanteens(),
          ])

        setOrders(ordersData)
        setUsers(usersData)
        setColleges(collegesData)
        setCanteens(canteensData)
      } catch (error) {
        console.error("Failed to fetch admin data:", error)
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      fetchData()
    }
  }, [isAuthenticated, user, toast])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const studentCount = users.filter((u) => u.role === "student").length
  const vendorCount = users.filter((u) => u.role === "vendor").length
  const totalOrders = orders.length
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Admin Dashboard</span>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your campus food ordering platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {studentCount} students, {vendorCount} vendors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Colleges</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{colleges.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered colleges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Canteens</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{canteens.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active canteens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {deliveredOrders} delivered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="canteens">Canteens ({canteens.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders across all canteens</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No orders yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => {
                        const status = statusConfig[order.status]
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                Order #{order.id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Canteen #{order.canteen_id} •{" "}
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                            <Badge className={`${status.color} flex items-center gap-1`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Colleges</CardTitle>
                  <CardDescription>Registered colleges</CardDescription>
                </CardHeader>
                <CardContent>
                  {colleges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No colleges registered
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {colleges.map((college) => (
                        <div
                          key={college.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium text-sm">{college.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Domains: {college.allowed_domains}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {canteens.filter((c) => c.college_id === college.id).length}{" "}
                            canteens
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No users registered
                  </p>
                ) : (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </div>
                        <Badge
                          className={
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "vendor"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {u.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View all platform orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No orders yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = statusConfig[order.status]
                      return (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Order #{order.id}</span>
                            <Badge className={`${status.color} flex items-center gap-1`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>User ID: {order.user_id}</p>
                            <p>Canteen ID: {order.canteen_id}</p>
                            <p>
                              Items:{" "}
                              {order.items
                                .map((i) => `Item #${i.menu_item_id} x${i.quantity}`)
                                .join(", ")}
                            </p>
                            <p>Placed: {formatDate(order.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Canteens Tab */}
          <TabsContent value="canteens">
            <Card>
              <CardHeader>
                <CardTitle>All Canteens</CardTitle>
                <CardDescription>View all registered canteens</CardDescription>
              </CardHeader>
              <CardContent>
                {canteens.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No canteens registered
                  </p>
                ) : (
                  <div className="space-y-4">
                    {canteens.map((canteen) => (
                      <div
                        key={canteen.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{canteen.name}</span>
                          <Badge variant="outline">
                            College #{canteen.college_id}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Vendor Email: {canteen.vendor_email}</p>
                          <p>Vendor Phone: {canteen.vendor_phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
