import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Decimal } from "@prisma/client/runtime/library";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | Decimal | string | null): string {
  if (price === null || price === undefined) return "$0.00";
  const num = typeof price === "object" && price instanceof Decimal 
    ? price.toNumber() 
    : Number(price);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function calculateDiscount(price: number | Decimal, comparePrice: number | Decimal | null): number {
  if (!comparePrice || comparePrice === 0) return 0;
  const p = price instanceof Decimal ? price.toNumber() : Number(price);
  const cp = comparePrice instanceof Decimal ? comparePrice.toNumber() : Number(comparePrice);
  return Math.round(((cp - p) / cp) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// CRITICAL FIX: Convert Prisma Decimal objects to plain numbers for Client Components
export function serializeProduct(product: any) {
  if (!product) return null;
  return {
    ...product,
    price: product.price instanceof Decimal ? product.price.toNumber() : Number(product.price),
    comparePrice: product.comparePrice instanceof Decimal 
      ? product.comparePrice.toNumber() 
      : product.comparePrice ? Number(product.comparePrice) : null,
    rating: product.rating instanceof Decimal ? product.rating.toNumber() : Number(product.rating),
    createdAt: product.createdAt?.toISOString?.() || product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() || product.updatedAt,
    category: product.category ? serializeCategory(product.category) : null,
  };
}

export function serializeCategory(category: any) {
  if (!category) return null;
  return {
    ...category,
    createdAt: category.createdAt?.toISOString?.() || category.createdAt,
    updatedAt: category.updatedAt?.toISOString?.() || category.updatedAt,
  };
}

export function serializeProducts(products: any[]) {
  return products.map(serializeProduct);
}