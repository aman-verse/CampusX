'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Utensils, Clock, CreditCard, MapPin, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Utensils,
    title: 'Explore Campus Food',
    description:
      'Browse menus from every canteen and food stall across campus.',
  },
  {
    icon: Clock,
    title: 'Skip the Queue',
    description:
      'Order ahead and pick up your meal when it’s ready.',
  },
  {
    icon: CreditCard,
    title: 'Fast Checkout',
    description:
      'Smooth and secure ordering experience for students.',
  },
  {
    icon: MapPin,
    title: 'Easy Pickup',
    description:
      'Pick up your order directly from campus vendors.',
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
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">
              Campus Eats
            </span>
          </Link>

          {isAuthenticated ? (
            <Button asChild>
              <Link href={getDashboardLink()}>
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}

        </div>
      </header>

      <main>

        {/* HERO */}

        <section className="relative min-h-[80vh] flex items-center justify-center">

          {/* BACKGROUND IMAGE */}

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')",
            }}
          />

          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-black/70" />

          {/* CONTENT */}

          <div className="relative container mx-auto px-4 flex justify-center">

            <div className="max-w-3xl text-center backdrop-blur-md bg-black/40 p-8 md:p-12 rounded-2xl border border-zinc-800">

              <h1 className="text-4xl md:text-6xl font-bold leading-tight">

                Delicious Food
                <span className="text-primary"> Across Your Campus</span>

              </h1>

              <p className="mt-6 text-lg text-zinc-300">

                Discover campus vendors, order your favorite meals in seconds,
                and pick them up fresh without long queues.

              </p>

              <div className="mt-10 flex justify-center">

                {isAuthenticated ? (
                  <Button size="lg" className="px-8 text-lg" asChild>
                    <Link href={getDashboardLink()}>
                      Browse Vendors
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="px-8 text-lg" asChild>
                    <Link href="/login">
                      Start Ordering
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section className="container mx-auto px-4 py-24">

          <div className="max-w-6xl mx-auto">

            <h2 className="text-3xl font-bold text-center mb-4">
              Built for Campus Food Lovers
            </h2>

            <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-12">
              A smarter and faster way to order food from campus vendors.
            </p>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-zinc-900/60 border-zinc-800 backdrop-blur hover:bg-zinc-900 hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="pt-6">

                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">

                      <feature.icon className="h-6 w-6 text-primary" />

                    </div>

                    <h3 className="font-semibold mb-2 text-lg">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-zinc-400">
                      {feature.description}
                    </p>

                  </CardContent>
                </Card>
              ))}

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="container mx-auto px-4 py-20 text-center border-t border-zinc-800">

          <h2 className="text-3xl font-bold mb-4">
            Ready to Order Your Meal?
          </h2>

          <p className="text-zinc-400 mb-8">
            Sign in and explore delicious food across your campus.
          </p>

          {!isAuthenticated && (
            <Button size="lg" asChild>
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

        </section>

      </main>


      {/* FOOTER */}

      <footer className="border-t border-zinc-800 py-10">

        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Campus Eats
            </span>
          </div>

          <p className="text-sm text-zinc-500">
            Smart Food Ordering for Campus Life
          </p>

        </div>

      </footer>

    </div>
  );
}