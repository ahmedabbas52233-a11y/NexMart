"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductSortProps {
  className?: string;
}

export function ProductSort({ className }: ProductSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sortBy") || "newest";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "newest") {
      params.delete("sortBy");
    } else {
      params.set("sortBy", value);
    }
    router.push(`/products?${params.toString()}`);
  };

  const options = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  return (
    <select
      aria-label="Sort products"
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className={cn(
        "rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}