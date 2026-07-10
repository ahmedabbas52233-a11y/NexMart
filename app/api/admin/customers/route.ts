import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/customers
 * Admin only: list users with order/spend stats, paginated (see
 * admin/products route for why unbounded findMany() doesn't scale).
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

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          orders: {
            select: { total: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    interface UserWithOrders {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
      createdAt: Date;
      orders: { total: unknown; status: string }[];
    }

    const customers = (users as UserWithOrders[]).map((user) => {
      const validOrders = user.orders.filter((o) => o.status !== "CANCELLED");
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        orderCount: user.orders.length,
        totalSpent: validOrders.reduce((sum: number, o) => sum + Number(o.total), 0),
      };
    });

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[ADMIN_CUSTOMERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
