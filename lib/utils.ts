import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind classes efficiently.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 * 
 * Why: Prevents class duplication and ensures the correct Tailwind utilities win.
 * Example: cn("px-2", "px-4") returns "px-4" (last one wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency with locale support.
 * Using Intl.NumberFormat for proper internationalization.
 */
export function formatPrice(price: number | string): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Calculates discount percentage between compare price and current price.
 */
export function calculateDiscount(price: number, comparePrice: number | null): number | null {
  if (!comparePrice || comparePrice <= price) return null;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Generates a slug from a string (URL-safe).
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
 * Serialize Prisma model — converts Decimal → number, Date → string
 * so objects are safe to pass from Server Components to Client Components.
 *
 * WHY: Prisma returns `Decimal` objects for price/rating fields.
 * Next.js App Router cannot serialize non-plain objects across the
 * Server→Client boundary and throws a runtime error that causes 404.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}
