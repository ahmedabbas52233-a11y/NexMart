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
export function formatPrice(price: number | string): string {
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
export function calculateDiscount(price: number, comparePrice: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Generates a URL-safe slug.
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
 * Serializes Prisma data — converts Decimal → number, Date → string.
 * Uses a replacer that calls .toString() on Decimal-like objects.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      // Prisma Decimal has .toString() and .toNumber() methods
      if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
        return value.toNumber();
      }
      // Fallback: if it has toString and isn't a plain object/array/date
      if (value && typeof value === "object" && "toString" in value && typeof value.toString === "function") {
        const str = value.toString();
        // If it looks like a number, return as number
        if (!isNaN(Number(str)) && str !== "[object Object]") {
          return Number(str);
        }
      }
      return value;
    })
  );
}