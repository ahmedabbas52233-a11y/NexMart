import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { calculateOrderTotals, generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const checkoutSchema = z.object({
  shippingName: z.string().min(2, "Name is required"),
  shippingEmail: z.string().email("A valid email is required"),
  shippingAddress: z.string().min(5, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().min(1, "State is required"),
  shippingZip: z.string().min(3, "ZIP/postal code is required"),
  shippingCountry: z.string().min(2, "Country is required"),
});

/**
 * GET /api/orders
 * Returns the current user's order history.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("[ORDERS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders
 *
 * Creates an order from the current cart (this is a demo checkout — no real
 * payment processor is integrated; the order is created directly as PENDING).
 * Runs in a transaction: re-validates stock, decrements it, snapshots each
 * line item's name/price/image, and clears the cart — all or nothing.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    interface CartItemWithProduct {
      productId: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: Prisma.Decimal | number | string;
        stock: number;
        isActive: boolean;
        images: string[];
      };
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cartItems = (await tx.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true },
      })) as unknown as CartItemWithProduct[];

      if (cartItems.length === 0) {
        throw new Error("EMPTY_CART");
      }

      for (const item of cartItems) {
        if (!item.product.isActive || item.product.stock < item.quantity) {
          throw new Error(`OUT_OF_STOCK:${item.product.name}`);
        }
      }

      const subtotal = cartItems.reduce(
        (sum: number, item: CartItemWithProduct) => sum + Number(item.product.price) * item.quantity,
        0
      );
      const totals = calculateOrderTotals(subtotal);

      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          subtotal: totals.subtotal,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          ...result.data,
          items: {
            create: cartItems.map((item: CartItemWithProduct) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images[0] ?? null,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: session.user.id } });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMPTY_CART") {
      return NextResponse.json(
        { success: false, error: "Your cart is empty" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
      const productName = error.message.split(":")[1];
      return NextResponse.json(
        { success: false, error: `${productName} no longer has enough stock` },
        { status: 400 }
      );
    }
    console.error("[ORDERS_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
