"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import type { College, Canteen, MenuItem, Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Utensils,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Package,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { items, canteenId, addItem, removeItem, updateQuantity, clearCart, getTotal, getItemCount } = useCart()
  const { toast } = useToast()

  const [colleges, setColleges] = useState<College[]>([])
  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null)
  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null)

  const [isLoadingColleges, setIsLoadingColleges] = useState(true)
  const [isLoadingCanteens, setIsLoadingCanteens] = useState(false)
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [showCart, setShowCart] = useState(false)
  const [showOrders, setShowOrders] = useState(false)

  // Redirect if not authenticated or not a student
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "student")) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, user, router])

  // Fetch colleges
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const data = await api.getColleges()
        setColleges(data)
        // Check if there's a stored college
        const storedCollegeId = localStorage.getItem("selected_college_id")
        if (storedCollegeId) {
          setSelectedCollegeId(Number(storedCollegeId))
        } else if (data.length === 1) {
          setSelectedCollegeId(data[0].id)
        }
      } catch (error) {
        console.error("Failed to fetch colleges:", error)
        toast({
          title: "Error",
          description: "Failed to load colleges",
          variant: "destructive",
        })
      } finally {
        setIsLoadingColleges(false)
      }
    }
    if (isAuthenticated) {
      fetchColleges()
    }
  }, [isAuthenticated, toast])

  // Fetch canteens when college is selected
  useEffect(() => {
    if (!selectedCollegeId) {
      setCanteens([])
      return
    }

    const fetchCanteens = async () => {
      setIsLoadingCanteens(true)
      try {
        const data = await api.getCanteensByCollege(selectedCollegeId)
        setCanteens(data)
        localStorage.setItem("selected_college_id", String(selectedCollegeId))
      } catch (error) {
        console.error("Failed to fetch canteens:", error)
        toast({
          title: "Error",
          description: "Failed to load canteens",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCanteens(false)
      }
    }
    fetchCanteens()
  }, [selectedCollegeId, toast])

  // Fetch menu when canteen is selected
  useEffect(() => {
    if (!selectedCanteenId) {
      setMenuItems([])
      return
    }

    const fetchMenu = async () => {
      setIsLoadingMenu(true)
      try {
        const data = await api.getMenuByCanteen(selectedCanteenId)
        setMenuItems(data)
        localStorage.setItem("selected_canteen_id", String(selectedCanteenId))
      } catch (error) {
        console.error("Failed to fetch menu:", error)
        toast({
          title: "Error",
          description: "Failed to load menu",
          variant: "destructive",
        })
      } finally {
        setIsLoadingMenu(false)
      }
    }
    fetchMenu()
  }, [selectedCanteenId, toast])

  // Fetch orders
  const fetchOrders = async () => {
    setIsLoadingOrders(true)
    try {
      const data = await api.getMyOrders()
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setIsLoadingOrders(false)
    }
  }

  useEffect(() => {
    if (showOrders && isAuthenticated) {
      fetchOrders()
    }
  }, [showOrders, isAuthenticated])

  const handlePlaceOrder = async () => {
    if (!canteenId || items.length === 0) return

    setIsPlacingOrder(true)
    try {
      const payload = {
        canteen_id: canteenId,
        items: items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      }

      await api.createOrder(payload)
      clearCart()
      setShowCart(false)
      toast({
        title: "Order Placed!",
        description: "Your order has been placed successfully",
      })
      // Refresh orders
      fetchOrders()
      setShowOrders(true)
    } catch (error) {
      console.error("Failed to place order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleLogout = () => {
    logout()
    clearCart()
    router.push("/login")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "placed":
        return <Clock className="w-4 h-4" />
      case "accepted":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "delivered":
        return <Package className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Campus Eats</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowOrders(!showOrders)
                setShowCart(false)
              }}
            >
              My Orders
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="relative bg-transparent"
              onClick={() => {
                setShowCart(!showCart)
                setShowOrders(false)
              }}
            >
              <ShoppingCart className="w-4 h-4" />
              {getItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Order food from your campus canteens</p>
        </div>

        {/* Cart Sidebar */}
        {showCart && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.menu_item_id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rs. {item.price} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.menu_item_id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() =>
                            updateQuantity(item.menu_item_id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.menu_item_id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>Rs. {getTotal()}</span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Orders Section */}
        {showOrders && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No orders yet
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Order #{order.id}</span>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Canteen ID: {order.canteen_id}</p>
                        <p>
                          Items:{" "}
                          {order.items
                            .map((i) => `Item #${i.menu_item_id} x${i.quantity}`)
                            .join(", ")}
                        </p>
                        <p>
                          Placed: {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Selection Flow */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* College Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select College</CardTitle>
              <CardDescription>Choose your college</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingColleges ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <Select
                  value={selectedCollegeId?.toString() || ""}
                  onValueChange={(value) => {
                    setSelectedCollegeId(Number(value))
                    setSelectedCanteenId(null)
                    setMenuItems([])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id.toString()}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Canteen Selection */}
          <Card>
            <CardHeader>
              <CardTitle>2. Select Canteen</CardTitle>
              <CardDescription>Choose a canteen to order from</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCanteens ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : !selectedCollegeId ? (
                <p className="text-sm text-muted-foreground">
                  Please select a college first
                </p>
              ) : canteens.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No canteens available
                </p>
              ) : (
                <Select
                  value={selectedCanteenId?.toString() || ""}
                  onValueChange={(value) => setSelectedCanteenId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select canteen" />
                  </SelectTrigger>
                  <SelectContent>
                    {canteens.map((canteen) => (
                      <SelectItem key={canteen.id} value={canteen.id.toString()}>
                        {canteen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Selected Canteen Info */}
          {selectedCanteenId && (
            <Card>
              <CardHeader>
                <CardTitle>Canteen Info</CardTitle>
              </CardHeader>
              <CardContent>
                {canteens.find((c) => c.id === selectedCanteenId) && (
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Name:</strong>{" "}
                      {canteens.find((c) => c.id === selectedCanteenId)?.name}
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      {canteens.find((c) => c.id === selectedCanteenId)?.vendor_phone}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Menu Section */}
        {selectedCanteenId && (
          <Card>
            <CardHeader>
              <CardTitle>3. Browse Menu</CardTitle>
              <CardDescription>
                Add items to your cart and place your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMenu ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : menuItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No menu items available
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-lg font-bold text-primary">
                              Rs. {item.price}
                            </p>
                          </div>
                          <Button size="sm" onClick={() => addItem(item)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
