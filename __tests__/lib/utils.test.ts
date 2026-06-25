import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes efficiently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as USD currency.
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "$0.00";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculates discount percentage.
 */
export function calculateDiscount(price: number, comparePrice: number | null | undefined): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Generates URL-safe slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncates text with ellipsis.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

/**
 * Serialize Prisma Decimal → plain number/string for Server→Client boundary.
 * CRITICAL: Prevents "Only plain objects can be passed to Client Components" error.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/**
 * Serialize product specifically — converts Decimal fields to numbers.
 * Use this before passing Prisma products to Client Components.
 */
export function serializeProduct(product: any) {
  return {
    ...product,
    price: typeof product.price === "object" ? parseFloat(product.price.toString()) : product.price,
    comparePrice: product.comparePrice 
      ? (typeof product.comparePrice === "object" ? parseFloat(product.comparePrice.toString()) : product.comparePrice)
      : null,
    rating: typeof product.rating === "object" ? parseFloat(product.rating.toString()) : product.rating,
    createdAt: product.createdAt?.toISOString?.() || product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() || product.updatedAt,
  };
}

/**
 * Serialize array of products.
 */
export function serializeProducts(products: any[]) {
  return products.map(serializeProduct);
}