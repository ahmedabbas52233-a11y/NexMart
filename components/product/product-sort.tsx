"use client";

import { ChevronDown } from "lucide-react";

/**
 * ProductSort — Client Component
 *
 * WHY separated from products/page.tsx:
 * The sort <select> uses onChange + window.location.href, which require
 * browser APIs unavailable in Server Components. Extracting it into
 * a client component is the correct Next.js App Router pattern:
 * keep the parent as a Server Component (direct DB access, SEO-friendly)
 * while pushing interactivity down to the smallest possible client boundary.
 */
interface ProductSortProps {
  defaultValue: string;
  buildUrl: (params: Record<string, string>) => string;
}

export function ProductSort({ defaultValue, buildUrl }: ProductSortProps) {
  return (
    <div className="relative">
      <select
        aria-label="Sort products by"
        className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        defaultValue={defaultValue}
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
  );
}
