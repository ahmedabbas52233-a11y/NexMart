import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/products
 *
 * Admin-only endpoint that returns products (including inactive), paginated.
 * WHY separate from public API:
 * - Admins need to see soft-deleted products for restoration
 * - Includes internal fields not exposed to public
 *
 * Paginated with a generous default limit (50) rather than the public API's
 * 12 — admin screens are denser by convention — but never unbounded: an
 * earlier version of this endpoint did a plain findMany() with no limit at
 * all, which is fine at a dozen products and a real problem at ten thousand.
 *
 * SECURITY: Double-checks admin role (middleware is first line).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const [products, total, inStock, featured, outOfStock] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { gt: 0 } } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { stock: 0 } }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      // Counted across ALL products, not just the current page — using
      // products.length/filter() on the paginated array here would silently
      // become wrong (undercounting) once there's more than one page.
      stats: { total, inStock, featured, outOfStock },
    });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
