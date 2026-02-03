'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Clock, CreditCard, MapPin, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Utensils,
    title: 'Browse Campus Vendors',
    description: 'Discover all the food options available across your campus in one place.',
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description: 'Track your order status from preparation to ready for pickup.',
  },
  {
    icon: CreditCard,
    title: 'Easy Ordering',
    description: 'Simple checkout process with secure payment options.',
  },
  {
    icon: MapPin,
    title: 'Campus Pickup',
    description: 'Pick up your order from your favorite vendor location.',
  },
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">Campus Eats</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link href={getDashboardLink()}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="container py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance">
              Order Food from
              <span className="text-primary"> Campus Vendors</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Skip the lines and order ahead from your favorite campus food vendors. 
              Browse menus, place orders, and pick up when ready.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" asChild>
                  <Link href={getDashboardLink()}>
                    Browse Vendors
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Sign in with Google</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="container py-24 border-t">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Ordering food on campus has never been easier. Follow these simple steps.
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container py-24 border-t">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Order?
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign in with your college Google account to start ordering from campus vendors.
            </p>
            {!isAuthenticated && (
              <Button size="lg" asChild>
                <Link href="/login">
                  Sign in with Google
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-semibold">Campus Eats</span>
          </div>
          <p className="text-sm text-muted-foreground">
            College Food Ordering System
          </p>
        </div>
      </footer>
    </div>
  );
}
