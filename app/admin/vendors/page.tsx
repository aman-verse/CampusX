'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import type { Vendor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Store, MapPin, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface VendorForm {
  name: string;
  description: string;
  location: string;
  image_url: string;
  is_open: boolean;
}

const defaultForm: VendorForm = {
  name: '',
  description: '',
  location: '',
  image_url: '',
  is_open: false,
};

function VendorsManagementContent() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<VendorForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const data = await api.getVendors();
        setVendors(data);
      } catch (error) {
        console.error('Failed to fetch vendors:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await api.createVendor({
        name: form.name,
        description: form.description,
        location: form.location,
        image_url: form.image_url || undefined,
        is_open: form.is_open,
      });
      setVendors((prev) => [...prev, created]);
      setIsDialogOpen(false);
      setForm(defaultForm);
      toast({
        title: 'Vendor created',
        description: `${form.name} has been added to the platform`,
      });
    } catch (error) {
      console.error('Failed to create vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vendor',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await api.deleteVendor(vendor.id);
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
      toast({
        title: 'Vendor deleted',
        description: `${vendor.name} has been removed from the platform`,
      });
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vendor',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                Manage Vendors
              </h1>
              <p className="text-muted-foreground mt-2">
                Add, edit, and remove vendors from the platform
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                  <DialogDescription>
                    Create a new vendor account on the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Vendor Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g., Campus Cafe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Describe the vendor..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="e.g., Building A, Ground Floor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL (optional)</Label>
                    <Input
                      id="image"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="open"
                      checked={form.is_open}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, is_open: checked })
                      }
                    />
                    <Label htmlFor="open">Open for orders</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Vendor'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {vendors.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No vendors yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first vendor to start accepting orders
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <div className="relative h-32 bg-muted">
                    {vendor.image_url ? (
                      <img
                        src={vendor.image_url || "/placeholder.svg"}
                        alt={vendor.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <Store className="h-8 w-8 text-primary/30" />
                      </div>
                    )}
                    <Badge
                      variant={vendor.is_open ? 'default' : 'secondary'}
                      className="absolute top-2 right-2"
                    >
                      {vendor.is_open ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{vendor.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {vendor.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-[120px]">
                            {vendor.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span>{vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {vendor.name} and all
                              their menu items. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(vendor)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function VendorsManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <VendorsManagementContent />
    </ProtectedRoute>
  );
}
