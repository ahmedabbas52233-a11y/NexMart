"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartAPI } from "@/hooks/useCartAPI";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    rating: number;
    reviewCount: number;
    stock: number;
    category?: { name: string } | null;
  };
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const { addToCart } = useCartAPI();
  const discount = calculateDiscount(product.price, product.comparePrice);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Double-check: don't add if out of stock
    if (isOutOfStock) return;
    addToCart(product.id, 1);
  };

  const imageUrl = product.images[0] || "/images/placeholder.png";

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg border border-border p-4 flex gap-4 hover:shadow-lg transition-shadow">
        <Link href={`/product/${product.slug}`} className="shrink-0">
          <div className="relative w-[200px] h-[200px] bg-background rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="200px"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/placeholder.png";
              }}
            />
          </div>
        </Link>
        <div className="flex-1 py-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="text-text-primary font-medium text-base hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.rating) ? "text-warning" : "text-border"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-warning text-sm">{product.rating}</span>
            <span className="text-text-secondary text-sm">({product.reviewCount})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-xl font-bold text-text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-text-secondary line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>Free Shipping</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="text-primary text-sm mt-2 inline-block hover:underline"
          >
            View details
          </Link>
        </div>
        <button 
          className="shrink-0 w-10 h-10 border border-border rounded-lg flex items-center justify-center text-primary hover:bg-surface-hover self-start"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-card-hover transition-shadow group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative h-[240px] bg-background overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.png";
            }}
          />
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-red-100 text-danger hover:bg-red-100 border-0">
              -{discount}%
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-text-primary">{formatPrice(product.price)}</span>
          {product.comparePrice && (
            <span className="text-text-secondary text-sm line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="text-text-muted text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-3.5 h-3.5 ${star <= Math.round(product.rating) ? "text-warning" : "text-border"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-text-secondary">({product.reviewCount})</span>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          variant="outline"
          className="w-full mt-3 border-border text-primary hover:bg-primary hover:text-white transition-colors"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}