import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/products
 * 
 * Admin-only endpoint that returns ALL products (including inactive).
 * WHY separate from public API:
 * - Admins need to see soft-deleted products for restoration
 * - No pagination (admin needs full overview)
 * - Includes internal fields not exposed to public
 * 
 * SECURITY: Double-checks admin role (middleware is first line).
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

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
