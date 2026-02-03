"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import type { Canteen, MenuItem, Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const {
    items,
    canteenId,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart()
  const { toast } = useToast()

  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null)

  const [isLoadingCanteens, setIsLoadingCanteens] = useState(false)
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [showCart, setShowCart] = useState(false)
  const [showOrders, setShowOrders] = useState(false)

  // 🔒 Get college from login context
  const collegeId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("selected_college_id"))
      : null

  // Redirect if not authenticated or invalid role
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "student")) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, user, router])

  // Safety: no college → logout
  useEffect(() => {
    if (!collegeId) {
      logout()
      router.push("/login")
    }
  }, [collegeId, logout, router])

  // Fetch canteens for logged-in college
  useEffect(() => {
    if (!collegeId) return

    const fetchCanteens = async () => {
      setIsLoadingCanteens(true)
      try {
        const data = await api.getCanteensByCollege(collegeId)
        setCanteens(data)
      } catch (err) {
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
  }, [collegeId, toast])

  // Fetch menu
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
      } catch {
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
      await api.createOrder({
        canteen_id: canteenId,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      })

      clearCart()
      setShowCart(false)
      toast({ title: "Order placed successfully!" })
      fetchOrders()
      setShowOrders(true)
    } catch (err) {
      toast({
        title: "Order failed",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const statusIcon = (s: string) =>
    s === "accepted" ? <CheckCircle /> :
      s === "rejected" ? <XCircle /> :
        s === "delivered" ? <Package /> :
          <Clock />

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b z-50">
        <div className="container mx-auto h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">Campus Eats</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOrders(!showOrders)}>
              My Orders
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowCart(!showCart)}>
              <ShoppingCart />
              {getItemCount() > 0 && <Badge>{getItemCount()}</Badge>}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              logout()
              clearCart()
              router.push("/login")
            }}>
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mb-6">
          Order food from your campus canteens
        </p>

        {/* Select Canteen */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Canteen</CardTitle>
            <CardDescription>Choose a canteen to order from</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCanteens ? (
              <Loader2 className="animate-spin" />
            ) : canteens.length === 0 ? (
              <p>No canteens available</p>
            ) : (
              <Select
                value={selectedCanteenId?.toString() || ""}
                onValueChange={(v) => setSelectedCanteenId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select canteen" />
                </SelectTrigger>
                <SelectContent>
                  {canteens.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Menu */}
        {selectedCanteenId && (
          <Card>
            <CardHeader>
              <CardTitle>Menu</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingMenu ? (
                <Loader2 className="animate-spin" />
              ) : menuItems.length === 0 ? (
                <p>No menu items</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {menuItems.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex justify-between">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-primary font-bold">₹{item.price}</p>
                        </div>
                        <Button size="sm" onClick={() => addItem(item)}>
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
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
