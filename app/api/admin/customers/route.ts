import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/admin/customers
 * Admin only: list all users with basic order/spend stats.
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

    const users = await prisma.user.findMany({
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
    });

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

    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    console.error("[ADMIN_CUSTOMERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
