"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { api } from "@/lib/api"
import type { Canteen, MenuItem } from "@/lib/types"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import {
  Utensils,
  ShoppingCart,
  Plus,
  LogOut,
  Loader2,
  Search
} from "lucide-react"

import { useToast } from "@/hooks/use-toast"

export default function StudentPage() {

  const router = useRouter()

  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  const { addItem, clearCart, getItemCount } = useCart()

  const { toast } = useToast()

  const [canteens, setCanteens] = useState<Canteen[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null)

  const [isLoadingCanteens, setIsLoadingCanteens] = useState(false)
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)

  const collegeId =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("selected_college_id"))
      : null


  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "student")) {
      router.push("/login")
    }
  }, [authLoading, isAuthenticated, user, router])


  useEffect(() => {

    if (!collegeId) return

    const fetchCanteens = async () => {

      setIsLoadingCanteens(true)

      try {

        const data = await api.getCanteensByCollege(collegeId)
        setCanteens(data)

      } catch {

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

        localStorage.setItem(
          "selected_canteen_id",
          String(selectedCanteenId)
        )

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


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  }


  return (

    <div className="min-h-screen bg-background">


      {/* HEADER */}

      <header className="sticky top-0 bg-background border-b z-50">

        <div className="container mx-auto h-16 flex justify-between items-center px-4">

          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-primary" />
            <span className="font-semibold text-lg">BITian Bites</span>
          </div>

          <div className="flex gap-3">

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/orders")}
            >
              Orders
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart />
              {getItemCount() > 0 && (
                <Badge className="ml-1">{getItemCount()}</Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout()
                clearCart()
                router.push("/login")
              }}
            >
              <LogOut />
            </Button>

          </div>

        </div>

      </header>


      {/* HERO */}

      <section className="container py-12 text-center">

        <h1 className="text-4xl font-bold">
          BIT Campus <span className="text-orange-500">Stalls</span>
        </h1>

        <p className="text-muted-foreground mt-2">
          Choose a stall inside / around BIT Mesra campus
        </p>

        <div className="mt-6 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-full border bg-background"
            placeholder="Search stalls..."
          />
        </div>

      </section>


      {/* STALLS */}

      <main className="container pb-16">

        {isLoadingCanteens ? (
          <Loader2 className="animate-spin" />
        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {canteens.map((c) => (

              <Card
                key={c.id}
                className="cursor-pointer hover:shadow-xl transition"
                onClick={() => setSelectedCanteenId(c.id)}
              >

                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                  <CardDescription>Campus Stall</CardDescription>
                </CardHeader>

                <CardContent className="flex justify-between">

                  <Badge>BIT Campus</Badge>

                  <Button size="sm">
                    View Menu
                  </Button>

                </CardContent>

              </Card>

            ))}

          </div>

        )}


        {/* MENU */}

        {selectedCanteenId && (

          <div className="mt-10">

            <h2 className="text-2xl font-bold mb-4">
              Menu
            </h2>

            {isLoadingMenu ? (
              <Loader2 className="animate-spin" />
            ) : (

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {menuItems.map((item) => (

                  <Card key={item.id}>

                    <CardContent className="p-4 flex justify-between">

                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-orange-500 font-bold">
                          ₹{item.price}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() =>
                          addItem({
                            ...item,
                            canteen_id: selectedCanteenId,
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>

                    </CardContent>

                  </Card>

                ))}

              </div>

            )}

          </div>

        )}

      </main>


      {/* FLOATING CART */}

      <div className="fixed bottom-6 right-6">

        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-xl"
          onClick={() => router.push("/cart")}
        >
          <ShoppingCart />
        </Button>

      </div>

    </div>

  )

}