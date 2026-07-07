import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/analytics
 * Admin only: aggregate real store metrics — no mock data.
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [orders, recentOrderItems, totalUsers, totalProducts] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
        select: { total: true, createdAt: true, status: true },
      }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } } },
        select: { productName: true, price: true, quantity: true },
      }),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    // Bucket revenue by day for the last 30 days
    const dailyRevenue: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyRevenue[date.toISOString().slice(0, 10)] = 0;
    }
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (key in dailyRevenue) {
        dailyRevenue[key] += Number(order.total);
      }
    }

    const revenueByDay = Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue }));
    const totalRevenue = orders.reduce((sum: number, o: { total: unknown }) => sum + Number(o.total), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const productTotals = new Map<string, { quantity: number; revenue: number }>();
    for (const item of recentOrderItems) {
      const existing = productTotals.get(item.productName) ?? { quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
      productTotals.set(item.productName, existing);
    }

    const topProducts = Array.from(productTotals.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders: orders.length,
        avgOrderValue,
        totalUsers,
        totalProducts,
        revenueByDay,
        topProducts,
      },
    });
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
