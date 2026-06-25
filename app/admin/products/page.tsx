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
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Product Management</h1>
            <p className="text-[#8B96A5] text-sm">Manage your store inventory</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-[#DEE2E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F3F5F9] border-b border-[#DEE2E7]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[#8B96A5]">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8B96A5]">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8B96A5]">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8B96A5]">Stock</th>
                  <th className="text-left px-4 py-3 font-medium text-[#8B96A5]">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-[#8B96A5]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {serializedProducts.map((product: any) => (
                  <tr key={product.id} className="border-b border-[#DEE2E7] last:border-0 hover:bg-[#F3F5F9]/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1C1C1C]">{product.name}</div>
                      <div className="text-xs text-[#8B96A5]">{product.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-[#8B96A5]">{product.category?.name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatPrice(Number(product.price))}</span>
                      {product.comparePrice && (
                        <span className="text-[#8B96A5] line-through ml-2 text-xs">
                          {formatPrice(Number(product.comparePrice))}
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
                        <Button variant="ghost" size="icon" className="w-8 h-8" aria-label="Edit product">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 text-[#FA3434] hover:text-red-700" aria-label="Delete product">
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