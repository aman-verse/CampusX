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
  CardDescription
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge"

import {
  Utensils,
  ShoppingCart,
  Plus,
  Loader2,
  Search,
  Star,
  LayoutDashboard,
  User,
  LogOut
} from "lucide-react"

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    )
  }


  return (

    <div className="min-h-screen bg-background relative">

      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
        }}
      />

      <div className="relative z-10">

        <header className="sticky top-0 bg-background border-b border-border z-50">

          <div className="container mx-auto h-16 flex justify-between items-center px-4">

            <div className="flex items-center gap-2">
              <Utensils className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">Campus Eats</span>
            </div>

            <div className="flex items-center gap-3">

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


              <DropdownMenu>

                <DropdownMenuTrigger asChild>

                  <Avatar className="cursor-pointer">

                    <AvatarFallback>
                      {user?.name?.[0] || "U"}
                    </AvatarFallback>

                  </Avatar>

                </DropdownMenuTrigger>


                <DropdownMenuContent align="end" className="w-56">

                  <div className="px-3 py-2">

                    <p className="font-medium">
                      {user?.name || "User"}
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
                    onClick={() => router.push("/student")}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/orders")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    My Orders
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="text-red-500"
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


        <section className="container py-12 text-center">

          <h1 className="text-4xl font-bold">
            Campus <span className="text-primary">Food Stalls</span>
          </h1>

          <p className="text-muted-foreground mt-2">
            Browse food vendors across your campus and order your favorite meals.
          </p>

          <div className="mt-6 max-w-xl mx-auto relative">

            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

            <input
              className="w-full pl-10 pr-4 py-3 rounded-full border border-border bg-background"
              placeholder="Search stalls..."
            />

          </div>

        </section>


        <main className="container mx-auto pb-16 relative">

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

                  <img
                    src="https://images.unsplash.com/photo-1550547660-d9450f859349"
                    className="w-full h-40 object-cover rounded-t-lg"
                  />

                  <CardHeader>

                    <CardTitle className="flex justify-between items-center">
                      {c.name}

                      <Badge variant="secondary">
                        Open
                      </Badge>

                    </CardTitle>

                    <CardDescription className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      4.5 Rating
                    </CardDescription>

                  </CardHeader>

                  <CardContent className="flex justify-between">

                    <Badge variant="secondary">
                      Campus Vendor
                    </Badge>

                    <Button size="sm">
                      View Menu
                    </Button>

                  </CardContent>

                </Card>

              ))}

            </div>

          )}

          {selectedCanteenId && (

            <div className="mt-10 mx-auto px-4">

              <h2 className="text-2xl font-bold mb-4">
                Menu
              </h2>

              {isLoadingMenu ? (
                <Loader2 className="animate-spin" />
              ) : (

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {menuItems.map((item) => (

                    <Card key={item.id}>

                      <img
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                        className="w-full h-32 object-cover rounded-t-lg"
                      />

                      <CardContent className="p-4 flex justify-between">

                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-primary font-bold">
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


        <footer className="border-t border-border py-10 mt-10">

          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm">

            <div>
              <h3 className="font-semibold text-lg">Campus Eats</h3>
              <p className="text-muted-foreground mt-2">
                Order food from campus vendors easily and quickly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">About</h3>
              <p className="text-muted-foreground mt-2">
                A campus food ordering platform designed for students.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Contact</h3>
              <p className="text-muted-foreground mt-2">
                Founder: Aman Singh
              </p>
              <p className="text-muted-foreground">
                Email: contact@campuseats.com
              </p>
            </div>

          </div>

          <div className="text-center text-muted-foreground mt-8 text-sm">
            © {new Date().getFullYear()} Campus Eats
          </div>

        </footer>

      </div>

    </div>

  )
}