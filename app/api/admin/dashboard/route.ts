import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/dashboard
 *
 * Admin-only dashboard summary. Uses targeted aggregate queries (count,
 * narrow-projection findMany) instead of fetching a page of products and
 * computing stats client-side — that approach silently breaks once
 * /api/admin/products is paginated (client-side stats would only reflect
 * whatever page happened to load, not the true totals).
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const [totalProducts, outOfStock, featured, stockValueRows, recentProducts, lowStockProducts] =
      await Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true, stock: 0 } }),
        prisma.product.count({ where: { isActive: true, isFeatured: true } }),
        prisma.product.findMany({
          where: { isActive: true },
          select: { price: true, stock: true },
        }),
        prisma.product.findMany({
          where: { isActive: true },
          include: { category: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.product.findMany({
          where: { isActive: true, stock: { gt: 0, lte: 5 } },
          include: { category: { select: { name: true } } },
          orderBy: { stock: "asc" },
          take: 5,
        }),
      ]);

    const inventoryValue = stockValueRows.reduce(
      (sum: number, p: { price: unknown; stock: number }) => sum + Number(p.price) * p.stock,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        outOfStock,
        featured,
        inventoryValue,
        recentProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
