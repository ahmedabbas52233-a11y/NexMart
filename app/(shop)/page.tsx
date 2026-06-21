import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Headphones, 
  Smartphone, 
  Laptop, 
  Camera, 
  Watch,
  Home,
  Sofa,
  Speaker
} from "lucide-react";

/**
 * Home Page
 * 
 * Architecture: Server Component (default in App Router)
 * WHY Server Component:
 * - Direct database access (no API layer needed)
 * - SEO-friendly HTML rendered on server
 * - Faster initial page load (no client JS for data fetch)
 * - Data fetching happens at build time or request time
 * 
 * Sections matching Figma design:
 * 1. Hero Banner - "Latest trending Electronic items"
 * 2. Category Grid - Icon-based category navigation
 * 3. Deals & Offers - Countdown + discounted products
 * 4. Featured Products - Grid of featured items
 * 5. Consumer Electronics - Category-specific showcase
 * 6. Recommended Items - Personalized suggestions
 */

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Electronics": <Speaker className="h-6 w-6" />,
  "Mobile Phones": <Smartphone className="h-6 w-6" />,
  "Laptops": <Laptop className="h-6 w-6" />,
  "Cameras": <Camera className="h-6 w-6" />,
  "Audio": <Headphones className="h-6 w-6" />,
  "Wearables": <Watch className="h-6 w-6" />,
  "Home & Outdoor": <Home className="h-6 w-6" />,
  "Furniture": <Sofa className="h-6 w-6" />,
};

async function getHomeData() {
  // Fetch featured products (isFeatured = true)
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  // Fetch deals (products with comparePrice)
  const deals = await prisma.product.findMany({
    where: { 
      isActive: true, 
      comparePrice: { not: null } 
    },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Fetch all categories
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch latest products
  const latestProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return { featuredProducts, deals, categories, latestProducts };
}

export default async function HomePage() {
  const { featuredProducts, deals, categories, latestProducts } = await getHomeData();

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Hero Content */}
            <div className="space-y-6">
              <Badge variant="default" className="bg-primary text-white">
                New Arrivals 2026
              </Badge>
              <h1 className="text-display text-text-primary leading-tight">
                Latest trending{" "}
                <span className="text-primary">Electronic items</span>
              </h1>
              <p className="text-body-lg text-text-secondary max-w-lg">
                Discover cutting-edge technology at unbeatable prices. From premium headphones to professional cameras, find your perfect gadget today.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <Button size="lg">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/products?category=electronics">
                  <Button variant="secondary" size="lg">
                    View Deals
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary">50K+</p>
                  <p className="text-sm text-text-secondary">Products</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">20K+</p>
                  <p className="text-sm text-text-secondary">Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-text-primary">4.9</p>
                  <p className="text-sm text-text-secondary">Rating</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800"
                  alt="Latest Electronics"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Floating Cards */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-card p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">Best Audio</p>
                  <p className="text-xs text-text-secondary">Premium sound</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-2 text-text-primary">Categories</h2>
          <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-surface hover:border-primary hover:shadow-card-hover transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {categoryIcons[category.name] || <Speaker className="h-6 w-6" />}
              </div>
              <span className="text-xs font-medium text-text-primary text-center line-clamp-1">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <Badge variant="warning" className="mb-2">Limited Time</Badge>
                <h2 className="text-heading-2 text-text-primary">Deals and Offers</h2>
                <p className="text-text-secondary mt-1">Up to 50% off on selected items</p>
              </div>
              <Link href="/products?sortBy=price-desc">
                <Button variant="secondary">View All Deals</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-heading-2 text-text-primary">Featured Products</h2>
            <p className="text-text-secondary mt-1">Handpicked by our experts</p>
          </div>
          <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Consumer Electronics Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12 items-center">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-0">Consumer Electronics</Badge>
              <h2 className="text-heading-1 text-white">Upgrade Your Tech Game</h2>
              <p className="text-primary-100 text-body-lg">
                From smart home devices to professional audio equipment, find everything you need to stay ahead.
              </p>
              <Link href="/products?category=electronics">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  Explore Collection
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block relative h-64">
              <Image
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600"
                alt="Consumer Electronics"
                fill
                className="object-cover rounded-xl"
                sizes="50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-heading-2 text-text-primary">Recommended Items</h2>
            <p className="text-text-secondary mt-1">Just added to our collection</p>
          </div>
          <Link href="/products?sortBy=newest" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
