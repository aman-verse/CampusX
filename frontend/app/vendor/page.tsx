"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"

import type { Order, Canteen, MenuItem } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import {
  Loader2,
  CheckCircle,
  Truck,
  XCircle,
  Utensils,
  LogOut
} from "lucide-react"

export default function VendorPage() {

  const router = useRouter()
  const { user, logout } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [canteen, setCanteen] = useState<Canteen | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  const [newItemName, setNewItemName] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")

  const audio = useRef<HTMLAudioElement | null>(null)
  const previousOrders = useRef<Order[]>([])

  //////////////////////////////////////////////////

  useEffect(() => {
    audio.current = new Audio("/notification.mp3")
  }, [])

  //////////////////////////////////////////////////

  const fetchOrders = async () => {

    try {

      const data = await api.getVendorOrders()

      if (previousOrders.current.length && data.length > previousOrders.current.length) {
        audio.current?.play()
      }

      previousOrders.current = data
      setOrders(data)

    } catch (err) {
      console.error(err)
    }

  }

  //////////////////////////////////////////////////

  useEffect(() => {

    const load = async () => {

      try {

        const vendorCanteen = await api.getVendorCanteen()
        setCanteen(vendorCanteen)

        const menu = await api.getMenuByCanteen(vendorCanteen.id)
        setMenuItems(menu)

        await fetchOrders()

      } catch (err) {
        console.error(err)
      }

      setLoading(false)

    }

    if (user?.role === "vendor") {
      load()
    }

  }, [user])

  //////////////////////////////////////////////////

  useEffect(() => {

    const interval = setInterval(fetchOrders, 5000)
    return () => clearInterval(interval)

  }, [])

  //////////////////////////////////////////////////
  // ACTIONS

  const acceptOrder = async (id: number) => {
    await api.acceptOrder(id)
    fetchOrders()
  }

  //////////////////////////////////////////////////
  // QUICK REJECT OPTIONS

  const quickReject = async (id: number, reason: string) => {
    await api.rejectOrder(id, reason)
    fetchOrders()
  }

  const rejectOrder = async (id: number) => {
    const reason = prompt("Enter custom reject reason")
    await api.rejectOrder(id, reason || undefined)
    fetchOrders()
  }

  //////////////////////////////////////////////////

  const deliverOrder = async (id: number) => {
    await api.markOrderDelivered(id)
    fetchOrders()
  }

  //////////////////////////////////////////////////

  const changeStatus = async (status: string) => {
    await api.updateCanteenStatus(status)
    if (canteen) {
      setCanteen({ ...canteen, status: status as any })
    }
  }

  //////////////////////////////////////////////////
  // ADD MENU ITEM (UI only)

  const addMenuItem = () => {

    if (!newItemName || !newItemPrice) return

    const item: MenuItem = {
      id: Date.now(),
      name: newItemName,
      price: Number(newItemPrice),
      canteen_id: canteen!.id
    }

    setMenuItems([...menuItems, item])
    setNewItemName("")
    setNewItemPrice("")
  }

  //////////////////////////////////////////////////

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  //////////////////////////////////////////////////

  if (loading) {

    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )

  }

  //////////////////////////////////////////////////

  const newOrders = orders.filter(o => o.status === "placed")
  const processingOrders = orders.filter(o => o.status === "accepted")
  const rejectedOrders = orders.filter(o => o.status === "rejected")
  const deliveredOrders = orders.filter(o => o.status === "delivered")

  //////////////////////////////////////////////////

  const OrderDetails = ({ order }: { order: any }) => (

    <div className="space-y-1">

      <p><b>Student:</b> {order.user?.name}</p>
      <p><b>Email:</b> {order.user?.email}</p>
      <p><b>Token:</b> {order.token}</p>
      <p><b>Phone:</b> {order.phone}</p>
      <p><b>Address:</b> {order.address}</p>

      <div className="border-t pt-2 mt-2">

        {order.items.map((item: any, i: number) => (

          <p key={i}>
            {item.menu_item?.name} × {item.quantity} =
            ₹{item.menu_item?.price * item.quantity}
          </p>

        ))}

      </div>

      {order.reject_reason && (
        <p className="text-red-500 text-sm">
          Reason: {order.reject_reason}
        </p>
      )}

      <p className="font-semibold mt-2">
        Total: ₹{order.total_amount}
      </p>

    </div>

  )

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

        <header className="sticky top-0 bg-background border-b border-border">

          <div className="max-w-6xl mx-auto h-16 flex justify-between items-center px-4">

            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">
                Campus Eats Vendor
              </span>
            </div>

            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>

          </div>

        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">

          {/* Vendor Info */}

          <Card className="mb-6">

            <CardHeader>

              <CardTitle>{canteen?.name}</CardTitle>

              <CardDescription>

                Vendor: {user?.name}
                <br />
                Phone: {canteen?.vendor_phone}
                <br />
                Email: {canteen?.vendor_email}

                <br /><br />

                <b>Status:</b>

                <div className="flex gap-2 mt-2">

                  <Button size="sm" onClick={() => changeStatus("open")}>
                    Open
                  </Button>

                  <Button size="sm" onClick={() => changeStatus("busy")}>
                    Busy
                  </Button>

                  <Button size="sm" onClick={() => changeStatus("closed")}>
                    Closed
                  </Button>

                </div>

              </CardDescription>

            </CardHeader>

          </Card>

          <Tabs defaultValue="new">

            <TabsList className="mb-6">

              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>

            </TabsList>

            {/* NEW ORDERS */}

            <TabsContent value="new">

              <div className="space-y-4">

                {newOrders.map(order => (

                  <Card key={order.id}>

                    <CardHeader>
                      <CardTitle>🍽 New Order #{order.id}</CardTitle>
                    </CardHeader>

                    <CardContent>

                      <OrderDetails order={order} />

                      <div className="flex flex-wrap gap-2 mt-3">

                        <Button size="sm" onClick={() => acceptOrder(order.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>

                        <Button size="sm" variant="outline"
                          onClick={() => quickReject(order.id, "Out of stock")}>
                          Out of stock
                        </Button>

                        <Button size="sm" variant="outline"
                          onClick={() => quickReject(order.id, "Too busy")}>
                          Too busy
                        </Button>

                        <Button size="sm" variant="outline"
                          onClick={() => quickReject(order.id, "Closed today")}>
                          Closed today
                        </Button>

                        <Button size="sm" variant="outline"
                          onClick={() => quickReject(order.id, "Ingredient finished")}>
                          Ingredient finished
                        </Button>

                        <Button size="sm" variant="outline"
                          onClick={() => rejectOrder(order.id)}>
                          Custom reason
                        </Button>

                      </div>

                    </CardContent>

                  </Card>

                ))}

              </div>

            </TabsContent>

            {/* PROCESSING */}

            <TabsContent value="processing">

              <div className="space-y-4">

                {processingOrders.map(order => (

                  <Card key={order.id}>

                    <CardHeader>
                      <CardTitle>🍳 Token #{order.token}</CardTitle>
                    </CardHeader>

                    <CardContent>

                      <OrderDetails order={order} />

                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={() => deliverOrder(order.id)}
                      >

                        <Truck className="w-4 h-4 mr-1" />
                        Delivered

                      </Button>

                    </CardContent>

                  </Card>

                ))}

              </div>

            </TabsContent>

            {/* REJECTED */}

            <TabsContent value="rejected">

              <div className="space-y-4">

                {rejectedOrders.map(order => (

                  <Card key={order.id}>

                    <CardHeader>
                      <CardTitle>❌ Token #{order.token}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <OrderDetails order={order} />
                    </CardContent>

                  </Card>

                ))}

              </div>

            </TabsContent>

            {/* DELIVERED */}

            <TabsContent value="delivered">

              <div className="space-y-4">

                {deliveredOrders.map(order => (

                  <Card key={order.id}>

                    <CardHeader>
                      <CardTitle>✅ Token #{order.token}</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <OrderDetails order={order} />
                    </CardContent>

                  </Card>

                ))}

              </div>

            </TabsContent>

            {/* MENU */}

            <TabsContent value="menu">

              <div className="mb-6">

                <h3 className="font-semibold mb-2">Add Menu Item</h3>

                <input
                  placeholder="Item name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="border p-2 mr-2"
                />

                <input
                  placeholder="Price"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="border p-2 mr-2"
                />

                <Button onClick={addMenuItem}>
                  Add Item
                </Button>

              </div>

              <div className="grid gap-4">

                {menuItems.map(item => (

                  <Card key={item.id}>

                    <CardHeader>

                      <CardTitle>{item.name}</CardTitle>
                      <p>₹{item.price}</p>

                    </CardHeader>

                  </Card>

                ))}

              </div>

            </TabsContent>

          </Tabs>

        </main>

      </div>

    </div>

  )

}