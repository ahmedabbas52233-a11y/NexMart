import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { serialize, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const serializedProducts = serialize(products);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Product Management</h1>
            <p className="text-text-secondary text-sm">Manage your store inventory</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-hover border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serializedProducts.map((product: any) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{product.name}</div>
                      <div className="text-xs text-text-secondary">{product.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{product.category?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatPrice(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-text-secondary line-through ml-2 text-xs">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-danger hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}