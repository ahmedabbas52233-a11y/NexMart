import { Suspense } from "react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  ChevronDown,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

/**
 * Products Listing Page
 * 
 * Server Component with searchParams for URL-based filtering.
 * WHY URL params over state:
 * 1. Shareable URLs ("Check out laptops under $1000")
 * 2. Browser back/forward works naturally
 * 3. SEO-friendly (search engines can crawl filtered pages)
 * 4. No client-side JS needed for initial render
 * 
 * Architecture:
 * - Server fetches data directly from Prisma (no API call overhead)
 * - Suspense boundaries for progressive loading
 * - Sidebar filters + mobile filter drawer
 */

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: "price-asc" | "price-desc" | "newest" | "rating";
    page?: string;
  };
}

async function getProducts(searchParams: ProductsPageProps["searchParams"]) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
      { brand: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = {};
  switch (searchParams.sortBy) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "rating":
      orderBy.rating = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { category: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return { products, total, categories, totalPages: Math.ceil(total / limit), page };
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, total, categories, totalPages, page } = await getProducts(searchParams);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    Object.entries({ ...searchParams, ...updates }).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    return `/products?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Title */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary">Products</span>
          {searchParams.category && (
            <>
              <span>/</span>
              <span className="text-text-primary capitalize">{searchParams.category.replace(/-/g, " ")}</span>
            </>
          )}
        </nav>
        <h1 className="text-heading-1 text-text-primary">
          {searchParams.search 
            ? `Search: "${searchParams.search}"` 
            : searchParams.category 
              ? categories.find(c => c.slug === searchParams.category)?.name || "Products"
              : "All Products"
          }
        </h1>
        <p className="text-text-secondary mt-1">{total} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Categories */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-semibold text-text-primary mb-3">Categories</h3>
              <div className="space-y-1">
                <Link
                  href="/products"
                  className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                    !searchParams.category 
                      ? "bg-primary-50 text-primary font-medium" 
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  All Categories
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={buildUrl({ category: category.slug })}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      searchParams.category === category.slug
                        ? "bg-primary-50 text-primary font-medium"
                        : "text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-semibold text-text-primary mb-3">Price Range</h3>
              <div className="space-y-2">
                {[
                  { label: "Under $100", min: "0", max: "100" },
                  { label: "$100 - $500", min: "100", max: "500" },
                  { label: "$500 - $1000", min: "500", max: "1000" },
                  { label: "$1000 - $2000", min: "1000", max: "2000" },
                  { label: "Over $2000", min: "2000", max: "999999" },
                ].map((range) => (
                  <Link
                    key={range.label}
                    href={buildUrl({ minPrice: range.min, maxPrice: range.max })}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                      searchParams.minPrice === range.min && searchParams.maxPrice === range.max
                        ? "bg-primary-50 text-primary font-medium"
                        : "text-text-secondary hover:bg-surface-hover"
                    }`}
                  >
                    {range.label}
                  </Link>
                ))}
                {(searchParams.minPrice || searchParams.maxPrice) && (
                  <Link
                    href={buildUrl({ minPrice: undefined, maxPrice: undefined })}
                    className="block px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-md transition-colors"
                  >
                    Clear Price Filter
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 rounded-lg border border-border bg-surface">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  value={searchParams.sortBy || "newest"}
                  onChange={(e) => {
                    const url = buildUrl({ sortBy: e.target.value });
                    window.location.href = url;
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                Showing {products.length} of {total}
              </span>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildUrl({ category: category.slug })}
                className={`shrink-0 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  searchParams.category === category.slug
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-text-secondary border-border hover:border-primary"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Product Grid */}
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-12 w-12 text-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">No products found</h3>
                <p className="text-text-secondary mb-4">Try adjusting your filters or search query</p>
                <Link href="/products">
                  <Button variant="secondary">Clear All Filters</Button>
                </Link>
              </div>
            )}
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Link
                href={page > 1 ? `/products?page=${page - 1}` : "#"}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  page <= 1 
                    ? "text-text-secondary cursor-not-allowed" 
                    : "text-text-primary hover:bg-surface-hover border border-border"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Link>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/products?page=${p}`}
                    className={`h-9 w-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-surface-hover border border-border"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>

              <Link
                href={page < totalPages ? `/products?page=${page + 1}` : "#"}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                  page >= totalPages
                    ? "text-text-secondary cursor-not-allowed"
                    : "text-text-primary hover:bg-surface-hover border border-border"
                }`}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
