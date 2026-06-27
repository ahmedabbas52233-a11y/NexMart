"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useCartAPI } from "@/hooks/useCartAPI";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  brand?: string | null;
  category: { name: string; slug: string };
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "list";
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCartAPI();

  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount = comparePrice && comparePrice > price
    ? Math.round((1 - price / comparePrice) * 100)
    : null;

  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const isOutOfStock = product.stock === 0;

  return (
    <div className={cn(
      "bg-white border border-[#DEE2E7] rounded-md overflow-hidden group hover:shadow-md hover:border-primary transition-all relative flex flex-col"
    )}>
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-[#FA3434] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          -{discount}%
        </div>
      )}

      <button
        aria-label="Add to wishlist"
        className="absolute top-2 right-2 z-10 h-7 w-7 flex items-center justify-center bg-white border border-[#DEE2E7] rounded opacity-0 group-hover:opacity-100 transition-opacity hover:border-primary hover:text-primary"
      >
        <Heart className="h-3.5 w-3.5" />
      </button>

      {isOutOfStock && (
        <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
          <span className="bg-[#DEE2E7] text-[#8B96A5] text-xs font-medium px-3 py-1 rounded-full">
            Out of Stock
          </span>
        </div>
      )}

      <Link href={`/product/${product.slug}`} className="block p-4 bg-white">
        <div className="aspect-square flex items-center justify-center">
          <Image
            src={product.images?.[0] || "/placeholder-product.svg"}
            alt={product.name}
            width={180}
            height={180}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="px-3 pb-3 flex flex-col flex-1">
        {/* Category name — renders as plain text so getByText finds it */}
        <span className="text-[10px] text-[#8B96A5] mb-1">{product.category.name}</span>

        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                i < Math.round(rating) ? "fill-[#FF9017] text-[#FF9017]" : "text-[#DEE2E7]"
              )}
            />
          ))}
          {reviewCount > 0 && (
            <span className="text-[10px] text-[#8B96A5] ml-0.5">({reviewCount})</span>
          )}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="text-sm text-[#1C1C1C] hover:text-primary line-clamp-2 mb-1 leading-snug flex-1"
        >
          {product.name}
        </Link>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-bold text-[#1C1C1C]">
            ${price.toFixed(2)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-[#8B96A5] line-through">
              ${comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        <p className="text-[10px] text-[#00B517] font-medium mt-0.5">Free Shipping</p>

        {/* Out-of-stock button has NO onClick so fireEvent.click can't trigger addToCart */}
        {isOutOfStock ? (
          <button
            disabled
            aria-label="Out of Stock"
            className={cn(
              "mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded text-xs font-medium transition-all",
              "opacity-0 group-hover:opacity-100",
              "bg-[#F3F5F9] text-[#8B96A5] cursor-not-allowed"
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Unavailable
          </button>
        ) : (
          <button
            onClick={() => {
              if (!isLoading) addToCart(product.id);
            }}
            disabled={isLoading}
            aria-label="Add to Cart"
            className={cn(
              "mt-2 w-full flex items-center justify-center gap-1.5 h-8 rounded text-xs font-medium transition-all",
              "opacity-0 group-hover:opacity-100",
              "text-primary border border-primary hover:bg-primary hover:text-white"
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}