'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function CartPage() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    items,
    canteenId,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
  } = useCart()

  const placeOrder = async () => {
    if (!canteenId || items.length === 0) return

    try {
      await api.createOrder({
        canteen_id: canteenId,
        items: items.map(i => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
        })),
      })

      clearCart()
      toast({ title: 'Order placed successfully 🎉' })
      router.push('/student')
    } catch (e) {
      toast({
        title: 'Order failed',
        variant: 'destructive',
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Cart is empty</h2>
        <Button onClick={() => router.push('/student')} className="mt-4">
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map(item => (
            <div key={item.menu_item_id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" onClick={() =>
                  updateQuantity(item.menu_item_id, item.quantity - 1)
                }>
                  <Minus />
                </Button>

                <span>{item.quantity}</span>

                <Button size="icon" onClick={() =>
                  updateQuantity(item.menu_item_id, item.quantity + 1)
                }>
                  <Plus />
                </Button>

                <Button size="icon" variant="ghost" onClick={() =>
                  removeItem(item.menu_item_id)
                }>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{getTotal()}</span>
          </div>

          <Button className="w-full" onClick={placeOrder}>
            Place Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
