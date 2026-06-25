import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Search className="w-16 h-16 text-border mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-text-primary mb-2">Product Not Found</h2>
        <p className="text-text-secondary mb-6">The product you are looking for does not exist.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );
}