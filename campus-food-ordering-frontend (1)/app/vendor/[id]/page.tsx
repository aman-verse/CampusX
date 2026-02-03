'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart-context';
import type { Vendor, MenuItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Star, Plus, Minus, Clock } from 'lucide-react';

function VendorDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { cart, addItem } = useCart();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const [vendorData, menuData] = await Promise.all([
          api.getVendor(vendorId),
          api.getVendorMenu(vendorId),
        ]);
        setVendor(vendorData);
        setMenuItems(menuData);
      } catch (error) {
        console.error('Failed to fetch vendor data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load vendor information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [vendorId, toast]);

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    if (!vendor) return;

    // Check if cart has items from a different vendor
    if (cart && cart.vendorId !== vendor.id) {
      toast({
        title: 'Different vendor',
        description: 'Adding items from a new vendor will clear your current cart.',
        variant: 'destructive',
      });
    }

    addItem(vendor, item, quantity);
    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
    toast({
      title: 'Added to cart',
      description: `${quantity}x ${item.name} added to your cart`,
    });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold">Vendor not found</h3>
            <p className="text-muted-foreground mt-1">
              The vendor you are looking for does not exist.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to vendors
        </Button>

        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 bg-muted">
            {vendor.image_url ? (
              <img
                src={vendor.image_url || "/placeholder.svg"}
                alt={vendor.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-6xl font-bold text-primary/20">
                  {vendor.name.charAt(0)}
                </span>
              </div>
            )}
            <Badge
              variant={vendor.is_open ? 'default' : 'secondary'}
              className="absolute top-4 right-4"
            >
              {vendor.is_open ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{vendor.name}</CardTitle>
                <CardDescription className="mt-2">
                  {vendor.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1 text-lg">
                <Star className="h-5 w-5 fill-primary text-primary" />
                <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{vendor.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {!vendor.is_open && (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardContent className="py-4">
              <p className="text-sm text-destructive font-medium">
                This vendor is currently closed. You can browse the menu but cannot place orders.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <Card key={item.id} className={!item.is_available ? 'opacity-60' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {item.description}
                          </CardDescription>
                        </div>
                        {item.image_url && (
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold">
                            ${item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.preparation_time} min</span>
                          </div>
                        </div>
                        {item.is_available && vendor.is_open ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={!quantities[item.id]}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {quantities[item.id] || 0}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddToCart(item)}
                              disabled={!quantities[item.id] && quantities[item.id] !== undefined}
                            >
                              Add
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">
                            {!item.is_available ? 'Unavailable' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {menuItems.length === 0 && (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold">No menu items</h3>
              <p className="text-muted-foreground mt-1">
                This vendor has not added any menu items yet.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VendorDetailPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <VendorDetailContent />
    </ProtectedRoute>
  );
}
