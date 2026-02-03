'use client';

import React from "react"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Package,
  Clock,
  CheckCircle,
  ChefHat,
  XCircle,
} from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-4 w-4" /> },
  accepted: { label: 'Accepted', variant: 'default', icon: <CheckCircle className="h-4 w-4" /> },
  preparing: { label: 'Preparing', variant: 'default', icon: <ChefHat className="h-4 w-4" /> },
  ready: { label: 'Ready', variant: 'default', icon: <Package className="h-4 w-4" /> },
  completed: { label: 'Completed', variant: 'outline', icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: <XCircle className="h-4 w-4" /> },
};

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function OrdersManagementContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await api.getAllOrders({ limit: 100 });
        setOrders(response.items);
        setFilteredOrders(response.items);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">All Orders</h1>
              <p className="text-muted-foreground mt-2">
                View and monitor all orders across vendors
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, vendor, or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No orders found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No orders have been placed yet'}
              </p>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                <CardDescription>
                  All orders sorted by most recent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const status = statusConfig[order.status];
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            {order.user?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {order.vendor?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {order.items.length} item
                            {order.items.length > 1 ? 's' : ''}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={status.variant}
                              className="flex items-center gap-1 w-fit"
                            >
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(order.created_at)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <OrdersManagementContent />
    </ProtectedRoute>
  );
}
