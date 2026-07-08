import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { serialize, formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Headphones, 
  ChevronRight
} from "lucide-react";

export const dynamic = "force-dynamic";

/* ─── Data Fetching ─── */
async function getHomeData() {
  const [categories, featuredProducts, deals, latestProducts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, comparePrice: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true },
    }),
  ]);

  return {
    categories: serialize(categories),
    featured: serialize(featuredProducts),
    deals: serialize(deals),
    latest: serialize(latestProducts),
  };
}

/* ─── Component ─── */
export default async function HomePage() {
  const { categories, deals, latest } = await getHomeData();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── HERO SECTION (Alibaba Style) ─── */}
      <section className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 py-6">
            {/* Category Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white rounded-lg border border-border overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-primary text-white font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  All Categories
                </div>
                <nav className="divide-y divide-border">
                  {categories.slice(0, 9).map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="flex items-center justify-between px-4 py-2.5 text-sm text-text-primary hover:bg-primary-50 hover:text-primary transition-colors"
                    >
                      {cat.name}
                      <ChevronRight className="w-4 h-4 text-text-secondary" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Banner */}
            <div className="lg:col-span-6">
              <div className="relative h-[360px] rounded-lg overflow-hidden bg-gradient-to-br from-[#0D6EFD] to-[#0052CC]">
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                  <span className="text-white/80 text-sm font-medium mb-2">Latest trending</span>
                  <h1 className="text-3xl font-bold text-white mb-2">Electronic items</h1>
                  <p className="text-white/70 mb-6 max-w-xs">Discover the best deals on top-quality electronics and gadgets</p>
                  <Link href="/products">
                    <Button className="w-fit bg-white text-primary hover:bg-white/90 font-medium">
                      Learn more
                    </Button>
                  </Link>
                </div>
                <div className="absolute right-4 bottom-4 opacity-10">
                  <ShoppingCart className="w-48 h-48 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
              <div className="bg-[#E3F0FF] rounded-lg p-4 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">Hi, user</p>
                    <p className="text-xs text-text-secondary">let&apos;s get started</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/signin">
                    <Button className="w-full bg-primary-gradient text-white text-sm h-9">Join now</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button variant="outline" className="w-full text-sm h-9 border-primary text-primary">Log in</Button>
                  </Link>
                </div>
              </div>
              <div className="bg-[#F38332] rounded-lg p-4 flex-1 flex flex-col justify-center">
                <p className="text-white text-sm font-medium leading-relaxed">Get US $10 off with a new supplier</p>
              </div>
              <div className="bg-[#55BDC4] rounded-lg p-4 flex-1 flex flex-col justify-center">
                <p className="text-white text-sm font-medium leading-relaxed">Send quotes with supplier preferences</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEALS & OFFERS ─── */}
      {deals.length > 0 && (
        <section className="py-8 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">Deals and offers</h2>
                  <p className="text-sm text-text-secondary">Hygiene equipments</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "Days", value: "04" },
                    { label: "Hour", value: "13" },
                    { label: "Min", value: "34" },
                    { label: "Sec", value: "56" },
                  ].map((t) => (
                    <div key={t.label} className="bg-gray-700 rounded px-2 py-1 text-center min-w-[45px]">
                      <div className="text-white font-bold text-sm">{t.value}</div>
                      <div className="text-white/70 text-[10px]">{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-border">
                {deals.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug || product.id}`}
                    className="group p-4 flex flex-col items-center text-center hover:bg-surface-hover transition-colors"
                  >
                    <div className="relative w-32 h-32 mb-3 bg-gray-50 rounded-lg overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <ShoppingCart className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm text-text-primary font-medium line-clamp-2 mb-2">{product.name}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                      -{Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── CATEGORY BLOCKS (Home & Outdoor, Electronics) ─── */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Home & Outdoor */}
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="col-span-1 p-5 bg-gray-50 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Home and outdoor</h3>
                  <Link href="/products?category=home-outdoor">
                    <Button variant="outline" size="sm" className="mt-3 text-xs">
                      Source now
                    </Button>
                  </Link>
                </div>
                <div className="col-span-2 grid grid-cols-2 divide-x divide-y divide-border">
                  {latest.slice(0, 4).map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      className="group p-3 flex items-center gap-3 hover:bg-surface-hover transition-colors"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 m-4 text-text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-text-primary font-medium line-clamp-2">{product.name}</p>
                        <p className="text-xs text-text-secondary mt-1">From <span className="text-text-muted">{formatPrice(Number(product.price))}</span></p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Consumer Electronics */}
            <div className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-3">
                <div className="col-span-1 p-5 bg-gray-50 flex flex-col justify-center">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Consumer electronics</h3>
                  <Link href="/products?category=electronics">
                    <Button variant="outline" size="sm" className="mt-3 text-xs">
                      Source now
                    </Button>
                  </Link>
                </div>
                <div className="col-span-2 grid grid-cols-2 divide-x divide-y divide-border">
                  {latest.slice(4, 8).map((product: any) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug || product.id}`}
                      className="group p-3 flex items-center gap-3 hover:bg-surface-hover transition-colors"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gray-50 rounded">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-contain p-1" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 m-4 text-text-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-text-primary font-medium line-clamp-2">{product.name}</p>
                        <p className="text-xs text-text-secondary mt-1">From <span className="text-muted">{formatPrice(Number(product.price))}</span></p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SEND INQUIRY CTA ─── */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-[#2C7CF1] to-[#00D1FF]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
              <div className="text-white">
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                  An easy way to send requests to all suppliers
                </h2>
                <p className="text-white/80 text-sm leading-relaxed max-w-md">
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Send quote to suppliers</h3>
                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="What item you need?"
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <textarea
                    placeholder="Type more details"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Quantity"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <select aria-label="Quantity unit" className="px-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option>Pcs</option>
                    </select>
                  </div>
                  <Button className="bg-primary-gradient text-white">Send inquiry</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── RECOMMENDED ITEMS ─── */}
      <section className="py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Recommended items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {latest.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── EXTRA SERVICES ─── */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Our extra services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Source from Industry Hub", icon: Search, color: "bg-gray-800" },
              { title: "Customize Your Products", icon: Truck, color: "bg-gray-800" },
              { title: "Fast, reliable shipping by ocean or air", icon: Shield, color: "bg-gray-800" },
              { title: "Product monitoring and inspection", icon: Headphones, color: "bg-gray-800" },
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-lg border border-border overflow-hidden group hover:shadow-card-hover transition-shadow">
                <div className={`h-24 ${service.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                </div>
                <div className="p-4 relative">
                  <div className="absolute -top-6 right-4 w-12 h-12 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-text-primary pr-14">{service.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUPPLIERS BY REGION ─── */}
      <section className="py-8 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Suppliers by region</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { name: "UAE", country: "Dubai", flag: "🇦🇪" },
              { name: "Australia", country: "Canberra", flag: "🇦🇺" },
              { name: "United States", country: "Washington", flag: "🇺🇸" },
              { name: "Denmark", country: "Copenhagen", flag: "🇩🇰" },
              { name: "France", country: "Paris", flag: "🇫🇷" },
              { name: "Russia", country: "Moscow", flag: "🇷🇺" },
              { name: "China", country: "Beijing", flag: "🇨🇳" },
              { name: "Italy", country: "Rome", flag: "🇮🇹" },
              { name: "Great Britain", country: "London", flag: "🇬🇧" },
              { name: "UAE", country: "Dubai", flag: "🇦🇪" },
            ].map((region, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer">
                <span className="text-2xl">{region.flag}</span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{region.name}</p>
                  <p className="text-xs text-text-secondary">{region.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="py-10 bg-[#EFF2F4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Subscribe on our newsletter</h2>
          <p className="text-sm text-text-secondary mb-6">
            Get daily news on upcoming offers from many suppliers all over the world
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button className="bg-primary-gradient text-white px-6">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}