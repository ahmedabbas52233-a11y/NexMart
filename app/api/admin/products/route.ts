import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ProductFilters } from "@/types";

/**
 * GET /api/products
 *
 * Returns paginated products with optional filtering:
 * - category: Filter by category slug
 * - search: Full-text search on name, description, and brand
 * - minPrice/maxPrice: Price range filter
 * - sortBy: Sort order (price-asc, price-desc, newest, rating)
 * - page/limit: Pagination
 *
 * WHY: Server-side filtering is more secure and efficient than client-side
 * for large datasets. Prisma's query engine optimizes the SQL generation.
 *
 * WHY Prisma.ProductWhereInput over `any`:
 * - Type-safe: compiler catches typos like `isActve` at build time
 * - Autocomplete in editor
 * - Refactoring-safe when schema changes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: ProductFilters = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      sortBy:
        (searchParams.get("sortBy") as ProductFilters["sortBy"]) || "newest",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "12"),
    };

    // ── Build where clause ─────────────────────────────────────────────────
    // Typed — no `any`. Prisma validates this against the schema at compile time.
    const where: Prisma.ProductWhereInput = { isActive: true };

    if (filters.category) {
      where.category = { slug: filters.category };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { brand: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price = { ...where.price as Prisma.DecimalFilter, gte: filters.minPrice };
      if (filters.maxPrice !== undefined) where.price = { ...where.price as Prisma.DecimalFilter, lte: filters.maxPrice };
    }

    // ── Build orderBy ──────────────────────────────────────────────────────
    const orderByMap: Record<
      NonNullable<ProductFilters["sortBy"]>,
      Prisma.ProductOrderByWithRelationInput
    > = {
      "price-asc": { price: "asc" },
      "price-desc": { price: "desc" },
      rating: { rating: "desc" },
      newest: { createdAt: "desc" },
    };

    const orderBy = orderByMap[filters.sortBy ?? "newest"];
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 *
 * Admin only: Create a new product.
 * Protected by middleware (requires ADMIN role).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        ...body,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}