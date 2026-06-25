import Link from "next/link";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";

export const revalidate = 60;

async function getHomeData() {
  const [featuredProducts, categories, deals] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.product.findMany({
      where: { comparePrice: { not: null }, isActive: true },
      take: 4,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    featuredProducts: serialize(featuredProducts),
    categories: serialize(categories),
    deals: serialize(deals),
  };
}

export default async function HomePage() {
  const { featuredProducts, categories, deals } = await getHomeData();

  const features = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
    { icon: Shield, title: "Secure Payment", desc: "100% protected checkout" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#0D6EFD] to-[#084298] text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover Premium Electronics
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/80">
              Shop the latest gadgets, audio gear, and smart devices with free shipping and 30-day returns.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-[#0D6EFD] hover:bg-white/90">
                  Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-b border-[#DEE2E7] bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E7F1FF] flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-[#0D6EFD]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1C1C1C] text-sm">{feature.title}</h3>
                  <p className="text-xs text-[#8B96A5]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">Shop by Category</h2>
            <Link href="/products" className="text-[#0D6EFD] hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group bg-white rounded-xl border border-[#DEE2E7] p-6 text-center hover:shadow-lg transition-all hover:border-[#0D6EFD]/30"
              >
                <div className="w-16 h-16 mx-auto bg-[#E7F1FF] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#CCE3FF] transition-colors">
                  <span className="text-2xl font-bold text-[#0D6EFD]">{category.name.charAt(0)}</span>
                </div>
                <h3 className="font-medium text-[#1C1C1C] text-sm">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">Hot Deals</h2>
                <p className="text-[#8B96A5] mt-1">Limited time offers on top products</p>
              </div>
              <Link href="/products" className="text-[#0D6EFD] hover:underline text-sm font-medium">
                View All Deals
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">Featured Products</h2>
              <p className="text-[#8B96A5] mt-1">Handpicked by our experts</p>
            </div>
            <Link href="/products" className="text-[#0D6EFD] hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#1C1C1C] to-[#2D2D2D] rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <span className="text-[#0D6EFD] font-semibold text-sm uppercase tracking-wider">New Arrivals</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2">Get 20% Off Your First Order</h2>
              <p className="text-white/70 mt-3">Use code WELCOME20 at checkout. Valid for new customers only.</p>
              <Link href="/products">
                <Button size="lg" className="mt-6 bg-[#0D6EFD] hover:bg-[#0A58CA]">
                  Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="w-64 h-64 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-6xl font-bold text-white/20">20%</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}