'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/protected-route'
import { Header } from '@/components/header'
import { api } from '@/lib/api'
import type { Order } from '@/lib/types'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

function OrdersManagementContent() {

  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    async function fetchOrders() {
      const data = await api.getAllOrders()
      setOrders(data)
    }

    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-background">

      <Header />

      <main className="container py-8">

        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <h1 className="text-3xl font-bold">
            All Orders
          </h1>
        </div>

        <Card>

          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>

          <CardContent>

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {orders.map((order) => (

                  <TableRow key={order.id}>

                    <TableCell>{order.id}</TableCell>

                    <TableCell>
                      {order.status}
                    </TableCell>

                    <TableCell>
                      {new Date(order.created_at).toLocaleString()}
                    </TableCell>

                  </TableRow>

                ))}

              </TableBody>

            </Table>

          </CardContent>

        </Card>

      </main>

    </div>
  )
}

export default function OrdersManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
      <OrdersManagementContent />
    </ProtectedRoute>
  )
}