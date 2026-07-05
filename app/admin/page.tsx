"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  AlertTriangle,
  Star,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  images: string[];
  category: { name: string };
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      })
      .catch((error) => console.error("Failed to fetch dashboard data:", error))
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const featured = products.filter((p) => p.isFeatured).length;
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const lowStockProducts = products
    .filter((p) => p.stock > 0 && p.stock <= 5)
    .slice(0, 5);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package },
    { label: "Inventory Value", value: formatPrice(inventoryValue), icon: Layers },
    { label: "Featured", value: featured, icon: Star },
    { label: "Out of Stock", value: outOfStock, icon: AlertTriangle },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-text-secondary" />
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-text-primary">Recently Added</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {loading ? (
              <p className="px-5 py-6 text-sm text-text-secondary">Loading...</p>
            ) : recentProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-text-secondary">No products yet</p>
            ) : (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-background shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder-product.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                    <p className="text-xs text-text-secondary">{product.category.name}</p>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {formatPrice(Number(product.price))}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-text-primary">Low Stock Alerts</h2>
            <Link href="/admin/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border-light">
            {loading ? (
              <p className="px-5 py-6 text-sm text-text-secondary">Loading...</p>
            ) : lowStockProducts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-text-secondary">Nothing running low</p>
            ) : (
              lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                    <p className="text-xs text-text-secondary">{product.category.name}</p>
                  </div>
                  <span className="text-sm font-medium text-warning">{product.stock} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
