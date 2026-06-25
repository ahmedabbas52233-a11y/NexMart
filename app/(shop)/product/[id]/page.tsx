import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { serialize, formatPrice, calculateDiscount } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, Shield, RotateCcw, Star, ChevronRight } from "lucide-react";

export const revalidate = 60;

async function getProduct(idOrSlug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      isActive: true,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!product) return null;

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  return {
    product: serialize(product),
    relatedProducts: serialize(relatedProducts),
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const data = await getProduct(params.id);
  if (!data) notFound();

  const { product, relatedProducts } = data;
  const price = Number(product.price);
  const comparePrice = product.comparePrice ? Number(product.comparePrice) : null;
  const discount = calculateDiscount(price, comparePrice);
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="w-4 h-4" />
          {product.category && (
            <>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-xl border border-border overflow-hidden">
              <Image
                src={product.images[0] || "/images/placeholder.png"}
                alt={product.name}
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder.png";
                }}
              />
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-100 text-danger border-0 text-sm px-3 py-1">
                  -{discount}% OFF
                </Badge>
              )}
              {!inStock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-sm">
                  <span className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium">Out of Stock</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="relative w-20 h-20 bg-white rounded-lg border border-border overflow-hidden cursor-pointer hover:border-primary transition-colors">
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-contain p-2" sizes="80px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="py-2">
            {product.category && (
              <Link href={`/products?category=${product.category.slug}`} className="text-primary text-sm font-medium hover:underline">
                {product.category.name}
              </Link>
            )}
            {product.brand && (
              <Badge variant="outline" className="ml-2">{product.brand}</Badge>
            )}

            <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(product.rating) ? "text-warning fill-warning" : "text-border"}`}
                  />
                ))}
              </div>
              <span className="text-warning font-medium">{product.rating}</span>
              <span className="text-text-secondary">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-3xl font-bold text-text-primary">{formatPrice(price)}</span>
              {comparePrice && (
                <span className="text-xl text-text-secondary line-through">{formatPrice(comparePrice)}</span>
              )}
              {discount > 0 && (
                <Badge className="bg-success/10 text-success border-0">Save {discount}%</Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-text-secondary mt-4 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${inStock ? "bg-success" : "bg-danger"}`} />
              <span className={inStock ? "text-success" : "text-danger"}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
              {lowStock && (
                <span className="text-warning text-sm">Only {product.stock} left - order soon!</span>
              )}
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-sm text-text-secondary mt-2">SKU: {product.sku}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button size="lg" className="flex-1" disabled={!inStock}>
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="px-4" aria-label="Add to wishlist">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 p-4 bg-white rounded-lg border border-border">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Shield, label: "2 Year Warranty" },
                { icon: RotateCcw, label: "30-Day Returns" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-6 h-6 text-primary mx-auto mb-1" />
                  <span className="text-xs text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-text-primary">You May Also Like</h2>
              <Link href="/products" className="text-primary hover:underline text-sm font-medium">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}