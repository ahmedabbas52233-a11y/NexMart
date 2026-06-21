"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { ProductWithCategory } from "@/types";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartAPI } from "@/hooks/useCartAPI";

/**
 * Product Card Component
 * 
 * Matches the Figma design:
 * - Product image with hover zoom
 * - Wishlist heart button
 * - Title, rating stars, price
 * - Discount badge if comparePrice exists
 * - Add to cart button
 * 
 * WHY Image component from Next.js:
 * - Automatic WebP/AVIF conversion
 * - Responsive srcset generation
 * - Lazy loading with blur placeholder
 * - Prevents layout shift (aspect ratio)
 */
interface ProductCardProps {
  product: ProductWithCategory;
  variant?: "default" | "compact";
}

export function ProductCard({ product, variant: _variant = "default" }: ProductCardProps) {
  const { addToCart } = useCartAPI();
  const discount = calculateDiscount(
    Number(product.price),
    product.comparePrice ? Number(product.comparePrice) : null
  );


  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-surface shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-background">
        <Image
          src={product.images[0] || "/placeholder-product.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Discount Badge */}
        {discount && (
          <Badge 
            variant="danger" 
            className="absolute top-2 left-2"
          >
            -{discount}%
          </Badge>
        )}

        {/* Wishlist Button */}
        <button
          className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-danger"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="secondary" className="text-base px-3 py-1">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Category */}
        <span className="text-xs text-text-secondary mb-1">
          {product.category.name}
        </span>

        {/* Title */}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-text-primary line-clamp-2 hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= Math.round(product.rating)
                    ? "fill-warning text-warning"
                    : "fill-border-light text-border-light"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-text-primary">
            {formatPrice(Number(product.price))}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(Number(product.comparePrice))}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button
          size="sm"
          className="w-full mt-auto"
          disabled={product.stock <= 0}
          onClick={() => addToCart(product.id)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
}
