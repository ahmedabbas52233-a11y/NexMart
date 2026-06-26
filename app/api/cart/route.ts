import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

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
 * Add an item to the cart or update quantity if already exists.
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
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Upsert cart item (create or update)
    const cartItem = await prisma.cartItem.upsert({
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

    return NextResponse.json({ success: true, data: cartItem }, { status: 201 });
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
 * Update cart item quantity.
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
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId,
        },
      });
      return NextResponse.json({ success: true, data: null });
    }

    const cartItem = await prisma.cartItem.update({
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

    return NextResponse.json({ success: true, data: cartItem });
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
 * Body: { productId: string }
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
