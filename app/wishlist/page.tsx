"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  brand: string | null;
  category: { name: string; slug: string };
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(data.data.map((item: { product: WishlistProduct }) => item.product));
        }
      })
      .catch((error) => console.error("Failed to fetch wishlist:", error))
      .finally(() => setLoading(false));
  }, [session, status]);

  if (status !== "loading" && !session?.user) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Heart className="h-12 w-12 text-text-secondary mx-auto mb-4" />
        <h1 className="text-heading-2 text-text-primary mb-2">Sign in to see your wishlist</h1>
        <p className="text-text-secondary mb-6">Save products you love and find them here later.</p>
        <Link href="/auth/signin?callbackUrl=/wishlist">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Wishlist</h1>

      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary mb-6">Your wishlist is empty.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                price: Number(product.price),
                comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
