'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { MenuItem } from '@/lib/types';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';

const categories = ['Appetizers', 'Main Course', 'Sides', 'Beverages', 'Desserts', 'Snacks'];

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  preparation_time: string;
  is_available: boolean;
}

const defaultForm: MenuItemForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image_url: '',
  preparation_time: '15',
  is_available: true,
};

function MenuManagementContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuItemForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchMenu() {
      if (!user?.vendor_id) return;

      try {
        const data = await api.getVendorMenu(user.vendor_id);
        setMenuItems(data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, [user?.vendor_id]);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        image_url: item.image_url || '',
        preparation_time: item.preparation_time.toString(),
        is_available: item.is_available,
      });
    } else {
      setEditingItem(null);
      setForm(defaultForm);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user?.vendor_id) return;

    setIsSubmitting(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category.toLowerCase(),
        image_url: form.image_url || undefined,
        preparation_time: parseInt(form.preparation_time),
        is_available: form.is_available,
      };

      if (editingItem) {
        const updated = await api.updateMenuItem(
          user.vendor_id,
          editingItem.id,
          data
        );
        setMenuItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? updated : item))
        );
        toast({
          title: 'Item updated',
          description: `${data.name} has been updated`,
        });
      } else {
        const created = await api.createMenuItem(user.vendor_id, data);
        setMenuItems((prev) => [...prev, created]);
        toast({
          title: 'Item created',
          description: `${data.name} has been added to your menu`,
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!user?.vendor_id) return;

    try {
      await api.deleteMenuItem(user.vendor_id, item.id);
      setMenuItems((prev) => prev.filter((i) => i.id !== item.id));
      toast({
        title: 'Item deleted',
        description: `${item.name} has been removed from your menu`,
      });
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!user?.vendor_id) return;

    try {
      const updated = await api.updateMenuItem(user.vendor_id, item.id, {
        is_available: !item.is_available,
      });
      setMenuItems((prev) =>
        prev.map((i) => (i.id === item.id ? updated : i))
      );
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive',
      });
    }
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
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
              <p className="text-muted-foreground mt-2">
                Add, edit, and manage your menu items
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingItem
                      ? 'Update the details of your menu item'
                      : 'Add a new item to your menu'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g., Chicken Burger"
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
                      placeholder="Describe your item..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                        placeholder="9.99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prep-time">Prep Time (min)</Label>
                      <Input
                        id="prep-time"
                        type="number"
                        min="1"
                        value={form.preparation_time}
                        onChange={(e) =>
                          setForm({ ...form, preparation_time: e.target.value })
                        }
                        placeholder="15"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) =>
                        setForm({ ...form, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat.toLowerCase()}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      id="available"
                      checked={form.is_available}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, is_available: checked })
                      }
                    />
                    <Label htmlFor="available">Available for order</Label>
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
                    {isSubmitting
                      ? 'Saving...'
                      : editingItem
                      ? 'Update'
                      : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {menuItems.length === 0 ? (
            <Card className="p-12 text-center">
              <h3 className="text-lg font-semibold">No menu items yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first menu item to start taking orders
              </p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4 capitalize">
                    {category}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <Card
                        key={item.id}
                        className={!item.is_available ? 'opacity-60' : ''}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {item.name}
                                {!item.is_available && (
                                  <Badge variant="secondary" className="text-xs">
                                    Unavailable
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1 line-clamp-2">
                                {item.description}
                              </CardDescription>
                            </div>
                            {item.image_url && (
                              <img
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover"
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
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={item.is_available}
                                onCheckedChange={() =>
                                  handleToggleAvailability(item)
                                }
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MenuManagementPage() {
  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <MenuManagementContent />
    </ProtectedRoute>
  );
}
