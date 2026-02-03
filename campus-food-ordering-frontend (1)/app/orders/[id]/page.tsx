'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, ChefHat, MapPin } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; description: string }> = {
  pending: { label: 'Pending', variant: 'secondary', icon: <Clock className="h-5 w-5" />, description: 'Waiting for vendor to accept your order' },
  accepted: { label: 'Accepted', variant: 'default', icon: <CheckCircle className="h-5 w-5" />, description: 'Vendor has accepted your order' },
  preparing: { label: 'Preparing', variant: 'default', icon: <ChefHat className="h-5 w-5" />, description: 'Your food is being prepared' },
  ready: { label: 'Ready for Pickup', variant: 'default', icon: <Package className="h-5 w-5" />, description: 'Your order is ready! Head to the vendor to pick it up' },
  completed: { label: 'Completed', variant: 'outline', icon: <CheckCircle className="h-5 w-5" />, description: 'Order has been completed' },
  cancelled: { label: 'Cancelled', variant: 'destructive', icon: <XCircle className="h-5 w-5" />, description: 'This order was cancelled' },
};

const statusSteps: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();

    // Poll for updates on active orders
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8 max-w-2xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card className="max-w-md mx-auto p-12 text-center">
            <h3 className="text-lg font-semibold">Order not found</h3>
            <p className="text-muted-foreground mt-1">
              The order you are looking for does not exist.
            </p>
            <Button onClick={() => router.push('/orders')} className="mt-4">
              Back to Orders
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/orders')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    Order #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <Badge variant={status.variant} className="flex items-center gap-1">
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                {status.icon}
                <p className="text-sm">{status.description}</p>
              </div>

              {!isCancelled && order.status !== 'completed' && (
                <div className="mt-6">
                  <div className="flex justify-between">
                    {statusSteps.slice(0, -1).map((step, index) => (
                      <div
                        key={step}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            index <= currentStepIndex
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <p className="text-xs mt-2 text-center capitalize">
                          {step}
                        </p>
                        {index < statusSteps.length - 2 && (
                          <div
                            className={`h-0.5 w-full mt-4 -mb-4 ${
                              index < currentStepIndex
                                ? 'bg-primary'
                                : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {order.vendor?.name || 'Unknown Vendor'}
              </CardTitle>
              {order.vendor?.location && (
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {order.vendor.location}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.menu_item?.name || 'Unknown Item'}
                      </p>
                      {item.special_instructions && (
                        <p className="text-sm text-muted-foreground">
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                {order.special_instructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium">Special Instructions</p>
                      <p className="text-sm text-muted-foreground">
                        {order.special_instructions}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(order.total_amount / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>${(order.total_amount - order.total_amount / 1.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.estimated_ready_time && order.status !== 'completed' && order.status !== 'cancelled' && (
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Estimated Ready Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.estimated_ready_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
