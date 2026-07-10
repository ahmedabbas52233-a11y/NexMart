import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().positive().max(99).default(1),
});

const updateCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(0).max(99),
});

/**
 * GET /api/cart
 *
 * Returns the current user's cart items with product details.
 * Requires authentication.
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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: cartItems });
  } catch (error) {
    console.error("[CART_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 *
 * Add an item to the cart, or increment quantity if it's already present.
 * Body: { productId: string, quantity?: number }
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
    const result = addToCartSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = result.data;

    try {
      const cartItem = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Lock this product's row for the duration of the transaction so
        // concurrent add-to-cart requests for the same product are
        // serialized — same class of check-then-write race as the checkout
        // fix, just without a stock column to decrement here (cart quantity
        // isn't a reservation; checkout re-validates atomically regardless).
        // Without this lock, two concurrent requests could both read the
        // same pre-update cart quantity and both pass the stock check,
        // leaving the cart showing more than is actually available.
        const rows = await tx.$queryRaw<{ id: string; stock: number; isActive: boolean }[]>`
          SELECT id, stock, "isActive" FROM products WHERE id = ${productId} FOR UPDATE
        `;
        const product = rows[0];

        if (!product || !product.isActive) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const existing = await tx.cartItem.findUnique({
          where: { userId_productId: { userId: session.user.id, productId } },
        });

        const desiredQuantity = (existing?.quantity ?? 0) + quantity;

        if (desiredQuantity > product.stock) {
          throw new Error(`OUT_OF_STOCK:${product.stock}`);
        }

        return tx.cartItem.upsert({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId,
            },
          },
          update: {
            quantity: { increment: quantity },
          },
          create: {
            userId: session.user.id,
            productId,
            quantity,
          },
          include: {
            product: {
              include: { category: true },
            },
          },
        });
      });

      return NextResponse.json({ success: true, data: cartItem }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
      if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
        const availableStock = error.message.split(":")[1];
        return NextResponse.json(
          { success: false, error: `Only ${availableStock} left in stock` },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[CART_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cart
 *
 * Set a cart item's quantity to an absolute value. A quantity of 0 removes it.
 * Body: { productId: string, quantity: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = updateCartSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { productId, quantity } = result.data;

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.user.id, productId },
      });
      return NextResponse.json({ success: true, data: null });
    }

    try {
      const cartItem = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Same row-lock rationale as POST above.
        const rows = await tx.$queryRaw<{ id: string; stock: number; isActive: boolean }[]>`
          SELECT id, stock, "isActive" FROM products WHERE id = ${productId} FOR UPDATE
        `;
        const product = rows[0];

        if (!product || !product.isActive) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (quantity > product.stock) {
          throw new Error(`OUT_OF_STOCK:${product.stock}`);
        }

        return tx.cartItem.update({
          where: {
            userId_productId: {
              userId: session.user.id,
              productId,
            },
          },
          data: { quantity },
          include: {
            product: {
              include: { category: true },
            },
          },
        });
      });

      return NextResponse.json({ success: true, data: cartItem });
    } catch (error) {
      if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
      if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
        const availableStock = error.message.split(":")[1];
        return NextResponse.json(
          { success: false, error: `Only ${availableStock} left in stock` },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[CART_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 *
 * Remove an item from the cart.
 * Query: ?productId=string
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}
