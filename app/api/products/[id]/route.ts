import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/products/[id]
 * 
 * Fetch a single product by ID or slug.
 * Used in product detail page.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/[id]
 * 
 * Admin only: Update a product.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_PATCH]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * 
 * Admin only: Soft delete (set isActive to false) or hard delete.
 * Using soft delete to preserve order history.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete - preserves data integrity
    const product = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
