import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/orders
 * Admin only: list orders across all users, paginated (see admin/products
 * route for why this matters — unbounded findMany() doesn't scale).
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

    const [orders, total, pending, delivered, revenueRows] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        select: { total: true },
      }),
    ]);

    const revenue = revenueRows.reduce(
      (sum: number, o: { total: unknown }) => sum + Number(o.total),
      0
    );

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      // Computed across ALL orders, not just the current page — see the
      // equivalent comment in admin/products for why that distinction
      // matters once there's more than one page of results.
      stats: { total, pending, delivered, revenue },
    });
  } catch (error) {
    console.error("[ADMIN_ORDERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
