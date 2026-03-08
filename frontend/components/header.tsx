'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import {
  Utensils,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

export function Header() {

  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();

  const itemCount = getItemCount();

  const getDashboardLink = () => {
    if (!user) return '/student';

    switch (user.role) {
      case 'vendor':
        return '/vendor';
      case 'admin':
        return '/admin';
      default:
        return '/student';
    }
  };

  const getInitials = () => {

    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }

    if (user?.email) {
      return user.email[0].toUpperCase();
    }

    return 'U';
  };

  return (

    <header className="sticky top-0 z-50 w-full border-b backdrop-blur bg-background/80">

      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}

        <Link
          href={isAuthenticated ? getDashboardLink() : '/'}
          className="flex items-center gap-2 group"
        >

          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition">

            <Utensils className="h-6 w-6 text-primary" />

          </div>

          <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Campus Eats
          </span>

        </Link>



        {/* Right Section */}

        <div className="flex items-center gap-4">

          {/* Cart */}

          {isAuthenticated && user?.role === 'student' && (

            <Link href="/cart">

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:scale-110 transition"
              >

                <ShoppingCart className="h-5 w-5" />

                {itemCount > 0 && (

                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse">

                    {itemCount}

                  </Badge>

                )}

              </Button>

            </Link>

          )}



          {/* Profile */}

          {isAuthenticated && user ? (

            <DropdownMenu>

              <DropdownMenuTrigger asChild>

                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary transition"
                >

                  <Avatar className="h-9 w-9">

                    <AvatarImage
                      src={user.picture || '/placeholder.svg'}
                      alt={user.name || 'User'}
                    />

                    <AvatarFallback>

                      {getInitials()}

                    </AvatarFallback>

                  </Avatar>

                </Button>

              </DropdownMenuTrigger>



              <DropdownMenuContent className="w-56" align="end">

                <div className="p-2 space-y-1">

                  <p className="text-sm font-medium">

                    {user.name || 'User'}

                  </p>

                  <p className="text-xs text-muted-foreground">

                    {user.email}

                  </p>

                  <Badge variant="secondary" className="capitalize">

                    {user.role}

                  </Badge>

                </div>



                <DropdownMenuSeparator />



                <DropdownMenuItem asChild>

                  <Link href={getDashboardLink()} className="flex items-center">

                    <LayoutDashboard className="mr-2 h-4 w-4" />

                    Dashboard

                  </Link>

                </DropdownMenuItem>



                {user.role === 'student' && (

                  <DropdownMenuItem asChild>

                    <Link href="/orders" className="flex items-center">

                      <User className="mr-2 h-4 w-4" />

                      My Orders

                    </Link>

                  </DropdownMenuItem>

                )}



                <DropdownMenuSeparator />



                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive"
                >

                  <LogOut className="mr-2 h-4 w-4" />

                  Sign out

                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          ) : (

            <Link href="/login">

              <Button className="hover:scale-105 transition">

                Sign In

              </Button>

            </Link>

          )}

        </div>

      </div>

    </header>

  );

}