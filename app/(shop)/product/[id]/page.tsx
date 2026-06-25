import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { serializeProducts } from "@/lib/utils";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import ProductList from "@/components/products/ProductList";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchParams {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  view?: string;
  page?: string;
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { description: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }

  const orderBy: any = {};
  switch (searchParams.sortBy) {
    case "price_asc": orderBy.price = "asc"; break;
    case "price_desc": orderBy.price = "desc"; break;
    case "rating": orderBy.rating = "desc"; break;
    case "newest": orderBy.createdAt = "desc"; break;
    default: orderBy.createdAt = "desc";
  }

  const [products, total, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.groupBy({
      by: ["brand"],
      where: { isActive: true, brand: { not: null } },
      _count: true,
    }),
  ]);

  return {
    products: serializeProducts(products),
    total,
    pages: Math.ceil(total / limit),
    categories,
    brands: brands.map(b => b.brand).filter(Boolean),
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { products, total, pages, categories, brands } = await getProducts(searchParams);
  const viewMode = searchParams.view === "list" ? "list" : "grid";

  return (
    <main className="min-h-screen bg-[#F7FAFC]">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(searchParams.category ? [{ label: searchParams.category, href: `#` }] : []),
        ]} />

        <div className="flex gap-6 mt-6">
          {/* Sidebar Filters */}
          <aside className="w-[240px] hidden lg:block shrink-0">
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
              <ProductFilters 
                categories={categories} 
                brands={brands}
                selectedCategory={searchParams.category}
              />
            </Suspense>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-[#DEE2E7] p-4 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-[#1C1C1C]">
                  <span className="font-semibold">{total}</span> items found
                  {searchParams.search && ` for "${searchParams.search}"`}
                </p>
                <div className="flex items-center gap-3">
                  <select 
                    name="sortBy"
                    className="border border-[#DEE2E7] rounded-md px-3 py-2 text-sm"
                    defaultValue={searchParams.sortBy || "newest"}
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <div className="flex border border-[#DEE2E7] rounded-md overflow-hidden">
                    <ViewToggleButton active={viewMode === "grid"} icon="grid" />
                    <ViewToggleButton active={viewMode === "list"} icon="list" />
                  </div>
                </div>
              </div>
            </div>

            {viewMode === "grid" ? (
              <ProductGrid products={products} />
            ) : (
              <ProductList products={products} />
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }, (_, i) => (
                  <a
                    key={i}
                    href={`?page=${i + 1}&${new URLSearchParams(searchParams as any).toString()}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border ${
                      page === i + 1
                        ? "bg-[#EFF2F4] border-[#DEE2E7] text-[#8B96A5]"
                        : "bg-white border-[#DEE2E7] text-[#1C1C1C] hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function ViewToggleButton({ active, icon }: { active: boolean; icon: string }) {
  return (
    <button
      className={`p-2 ${active ? "bg-[#EFF2F4]" : "bg-white"}`}
      aria-label={`${icon} view`}
    >
      {icon === "grid" ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/>
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
        </svg>
      )}
    </button>
  );
}