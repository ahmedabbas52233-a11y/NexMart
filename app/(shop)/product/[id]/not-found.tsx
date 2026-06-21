import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft } from "lucide-react";

/**
 * Not Found Page for Product Detail
 * 
 * Displayed when a product slug doesn't exist.
 * Provides helpful navigation back to products.
 */
export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 rounded-full bg-primary-50 flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-heading-1 text-text-primary mb-2">Product Not Found</h1>
        <p className="text-text-secondary mb-6 max-w-md">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="flex gap-3">
          <Link href="/products">
            <Button variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
