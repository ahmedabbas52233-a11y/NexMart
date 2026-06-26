"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * ProductSort — Client Component
 *
 * WHY client-side URL building (not props from server):
 * Next.js App Router cannot serialize plain functions across the
 * Server → Client boundary. Passing buildUrl as a prop causes a
 * runtime crash. Instead, this component reads the current search
 * params itself via useSearchParams and builds the new URL locally.
 */
interface ProductSortProps {
  defaultValue: string;
}

export function ProductSort({ defaultValue }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = (sortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortBy === "newest") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", sortBy);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <div className="relative">
      <select
        aria-label="Sort products by"
        className="appearance-none bg-background border border-border rounded-md px-3 py-1.5 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        defaultValue={defaultValue}
        onChange={(e) => handleSort(e.target.value)}
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
