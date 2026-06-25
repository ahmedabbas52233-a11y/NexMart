import Link from "next/link";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 12;

async function getProducts(searchParams: SearchParams) {
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: any = { isActive: true };

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  if (searchParams.sortBy === "price-asc") orderBy = { price: "asc" };
  if (searchParams.sortBy === "price-desc") orderBy = { price: "desc" };
  if (searchParams.sortBy === "rating") orderBy = { rating: "desc" };
  if (searchParams.sortBy === "discount") orderBy = { comparePrice: "desc" };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return {
    products: serialize(products),
    totalCount,
    categories: serialize(categories),
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
    currentPage: page,
  };
}

function buildQueryString(params: SearchParams, overrides: Record<string, string | undefined>) {
  const newParams = new URLSearchParams();
  Object.entries({ ...params, ...overrides }).forEach(([key, value]) => {
    if (value !== undefined && value !== "") newParams.set(key, value);
  });
  return newParams.toString();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, totalCount, categories, totalPages, currentPage } = await getProducts(searchParams);

  const priceRanges = [
    { label: "Under $100", min: "0", max: "100" },
    { label: "$100 - $500", min: "100", max: "500" },
    { label: "$500 - $1000", min: "500", max: "1000" },
    { label: "$1000 - $2000", min: "1000", max: "2000" },
    { label: "Over $2000", min: "2000", max: "999999" },
  ];

  const currentCategory = searchParams.category
    ? categories.find((c: any) => c.slug === searchParams.category)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-text-primary">
              {searchParams.search
                ? `Search: "${searchParams.search}"`
                : currentCategory?.name || "All Products"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            {searchParams.search
              ? `Search Results for "${searchParams.search}"`
              : currentCategory?.name || "All Products"}
          </h1>
          <p className="text-text-secondary mt-1">{totalCount} products found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-lg border border-border p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-text-secondary" />
                <h3 className="font-semibold text-text-primary">Filters</h3>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3">Categories</h4>
                <div className="space-y-2">
                  <Link
                    href="/products"
                    className={`block text-sm ${!searchParams.category ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`}
                  >
                    All Categories
                  </Link>
                  {categories.map((cat: any) => (
                    <Link
                      key={cat.id}
                      href={`/products?${buildQueryString(searchParams, { category: cat.slug, page: undefined })}`}
                      className={`block text-sm ${searchParams.category === cat.slug ? "text-primary font-medium" : "text-text-secondary hover:text-primary"}`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-text-primary mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <Link
                      key={range.label}
                      href={`/products?${buildQueryString(searchParams, { minPrice: range.min, maxPrice: range.max, page: undefined })}`}
                      className={`block text-sm ${(searchParams.minPrice === range.min && searchParams.maxPrice === range.max)
                        ? "text-primary font-medium"
                        : "text-text-secondary hover:text-primary"
                        }`}
                    >
                      {range.label}
                    </Link>
                  ))}
                </div>
                {(searchParams.minPrice || searchParams.maxPrice) && (
                  <Link
                    href={`/products?${buildQueryString(searchParams, { minPrice: undefined, maxPrice: undefined, page: undefined })}`}
                    className="text-xs text-danger hover:underline mt-2 inline-block"
                  >
                    Clear Price Filter
                  </Link>
                )}
              </div>

              {/* Sort */}
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-3">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { label: "Newest", value: "" },
                    { label: "Price: Low to High", value: "price-asc" },
                    { label: "Price: High to Low", value: "price-desc" },
                    { label: "Highest Rated", value: "rating" },
                    { label: "Best Deals", value: "discount" },
                  ].map((sort) => (
                    <Link
                      key={sort.value}
                      href={`/products?${buildQueryString(searchParams, { sortBy: sort.value || undefined, page: undefined })}`}
                      className={`block text-sm ${searchParams.sortBy === sort.value || (!searchParams.sortBy && !sort.value)
                        ? "text-primary font-medium"
                        : "text-text-secondary hover:text-primary"
                        }`}
                    >
                      {sort.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="bg-white rounded-lg border border-border p-12 text-center">
                <Search className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text-primary">No products found</h3>
                <p className="text-text-secondary mt-2">Try adjusting your search or filters.</p>
                <Link href="/products">
                  <Button variant="outline" className="mt-4">Clear All Filters</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Link
                      href={`/products?${buildQueryString(searchParams, { page: String(currentPage - 1) })}`}
                      className={`w-10 h-10 rounded-lg border border-border flex items-center justify-center ${currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-surface-hover text-text-secondary"
                        }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Link
                        key={page}
                        href={`/products?${buildQueryString(searchParams, { page: String(page) })}`}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${page === currentPage
                          ? "bg-primary text-white"
                          : "border border-border text-text-secondary hover:bg-surface-hover"
                          }`}
                      >
                        {page}
                      </Link>
                    ))}

                    <Link
                      href={`/products?${buildQueryString(searchParams, { page: String(currentPage + 1) })}`}
                      className={`w-10 h-10 rounded-lg border border-border flex items-center justify-center ${currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-surface-hover text-text-secondary"
                        }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}