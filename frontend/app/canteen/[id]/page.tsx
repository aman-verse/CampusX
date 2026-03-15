"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"

import type { MenuItem } from "@/lib/types"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
    Loader2,
    ShoppingCart,
    ArrowLeft,
    Plus,
    Utensils,
    LayoutDashboard,
    User,
    LogOut,
    Search
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"


export default function CanteenPage() {

    const { id } = useParams()
    const router = useRouter()

    const { user, logout } = useAuth()
    const { addItem, getItemCount, clearCart } = useCart()

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")


    useEffect(() => {

        const fetchMenu = async () => {

            try {

                const data = await api.getMenuByCanteen(Number(id))
                setMenuItems(data)

            } finally {

                setLoading(false)

            }

        }

        fetchMenu()

    }, [id])


    return (

        <div className="min-h-screen bg-background relative">

            {/* background */}

            <div
                className="absolute inset-0 bg-cover bg-center opacity-10"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')"
                }}
            />

            <div className="relative z-10">


                {/* HEADER (same as student page) */}

                <header className="sticky top-0 bg-background border-b border-border">

                    <div className="container mx-auto h-16 flex justify-between items-center px-4">

                        <div className="flex items-center gap-2">

                            <Utensils className="w-6 h-6 text-primary" />

                            <span
                                className="font-semibold text-lg cursor-pointer"
                                onClick={() => router.push("/student")}
                            >
                                Campus Eats
                            </span>

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

                                        <p className="font-medium">{user?.name}</p>

                                        <p className="text-xs text-muted-foreground">
                                            {user?.email}
                                        </p>

                                        {user?.phone && (
                                            <p className="text-xs text-muted-foreground">
                                                📞 {user.phone}
                                            </p>
                                        )}

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



                {/* MENU PAGE */}

                <main className="container mx-auto py-12">


                    <Button
                        variant="outline"
                        className="mb-6"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>


                    <h1 className="text-3xl font-bold mb-6">
                        Menu
                    </h1>


                    {/* SEARCH BAR */}

                    <div className="mb-8 flex justify-center">

                        <div className="relative w-full max-w-xl">

                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-full border border-border bg-background"
                                placeholder="Search food..."
                            />

                        </div>

                    </div>



                    {loading ? (

                        <Loader2 className="animate-spin" />

                    ) : (

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                            {menuItems
                                .filter(item =>
                                    item.name.toLowerCase().includes(search.toLowerCase())
                                )
                                .map(item => (

                                    <Card key={item.id}>

                                        <CardContent className="p-4 flex justify-between">

                                            <div>

                                                <p className="font-semibold">
                                                    {item.name}
                                                </p>

                                                <p className="text-primary font-bold">
                                                    ₹{item.price}
                                                </p>

                                            </div>


                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    addItem({
                                                        ...item,
                                                        canteen_id: Number(id)
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

                </main>



                {/* FLOATING CART BUTTON */}

                {getItemCount() > 0 && (

                    <Button
                        onClick={() => router.push("/cart")}
                        className="fixed bottom-21 right-13 z-50 shadow-xl rounded-full h-14 w-14 flex items-center justify-center"
                    >

                        <ShoppingCart className="w-5 h-5" />

                        <Badge className="absolute -top-2 -right-2">
                            {getItemCount()}
                        </Badge>

                    </Button>

                )}



                {/* FOOTER */}

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