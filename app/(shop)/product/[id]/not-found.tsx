import { ProductNotFound } from "@/components/product/product-not-found";

/**
 * Framework-level fallback for this route segment. Kept as a defensive
 * backup, but the product page renders ProductNotFound inline directly —
 * nested not-found.tsx files inside route groups like (shop) have a
 * well-documented Next.js bug where they can be bypassed in favor of the
 * root app/not-found.tsx, so the inline render is what's actually relied on.
 */
export default function NotFound() {
  return <ProductNotFound />;
}
