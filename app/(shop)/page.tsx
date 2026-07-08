import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, calculateDiscount, serialize } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductNotFound } from "@/components/product/product-not-found";
import { 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Check,
} from "lucide-react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

interface ProductPageProps {
  params: { id: string };
}

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
      isActive: true,
    },
    include: { category: true },
  });

  if (!product) return null;

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { category: true },
    take: 4,
  });

  return { product: serialize(product), relatedProducts: serialize(relatedProducts) };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const data = await getProduct(params.id);
  if (!data) return { title: "Product Not Found" };

  return {
    title: data.product.name,
    description: data.product.description.slice(0, 160),
    openGraph: {
      images: data.product.images[0] ? [data.product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProduct(params.id);

  if (!data) {
    // Rendered inline rather than calling notFound() — nested not-found.tsx
    // files inside route groups like (shop) have a well-documented Next.js
    // bug where they get bypassed in favor of the generic root 404 (see
    // vercel/next.js#54980, #59180). This guarantees the correct, styled
    // "Product Not Found" UI at the cost of returning HTTP 200 instead of
    // 404 for a missing product — an acceptable tradeoff for this project.
    return <ProductNotFound />;
  }

  const { product, relatedProducts } = data;
  const discount = calculateDiscount(
    Number(product.price),
    product.comparePrice ? Number(product.comparePrice) : null
  );

  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
        <span>/</span>
        <Link 
          href={`/products?category=${product.category.slug}`} 
          className="hover:text-primary transition-colors capitalize"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-text-primary truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery
          images={product.images}
          name={product.name}
          discount={discount}
          inStock={inStock}
        />

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category.name}</Badge>
              {product.brand && (
                <Badge variant="secondary">{product.brand}</Badge>
              )}
            </div>
            <h1 className="text-heading-1 text-text-primary">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.rating)
                        ? "fill-warning text-warning"
                        : "fill-border-light text-border-light"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(Number(product.price))}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-text-secondary line-through">
                {formatPrice(Number(product.comparePrice))}
              </span>
            )}
            {discount && (
              <Badge variant="destructive" className="ml-auto">
                Save {discount}%
              </Badge>
            )}
          </div>

          <p className="text-body-lg text-text-secondary leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <Check className="h-5 w-5 text-success" />
                <span className="text-sm text-success font-medium">In Stock</span>
                {lowStock && (
                  <span className="text-sm text-warning">Only {product.stock} left - order soon!</span>
                )}
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-danger" />
                <span className="text-sm text-danger font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {product.sku && (
            <div className="text-sm text-text-secondary">
              SKU: <span className="font-mono text-text-primary">{product.sku}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <AddToCartButton 
              productId={product.id} 
              disabled={!inStock}
            />
            <ProductActions productId={product.id} productName={product.name} />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface border border-border text-center">
              <Truck className="h-6 w-6 text-primary" />
              <span className="text-xs text-text-secondary">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface border border-border text-center">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xs text-text-secondary">2 Year Warranty</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface border border-border text-center">
              <RotateCcw className="h-6 w-6 text-primary" />
              <span className="text-xs text-text-secondary">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-heading-2 text-text-primary">You May Also Like</h2>
            <Link href={`/products?category=${product.category.slug}`} className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}