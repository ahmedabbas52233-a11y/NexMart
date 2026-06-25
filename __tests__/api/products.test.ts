import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Define mocks with explicit types BEFORE importing route
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockCreate = vi.fn();

const mockPrisma = {
  product: {
    findMany: mockFindMany as Mock,
    count: mockCount as Mock,
    create: mockCreate as Mock,
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { GET, POST } from "@/app/api/products/route";

const mockProducts = [
  {
    id: "prod-1",
    name: "iPhone 14 Pro",
    slug: "iphone-14-pro",
    price: 999.99,
    comparePrice: 1199.99,
    stock: 15,
    isActive: true,
    isFeatured: true,
    category: { id: "cat-1", name: "Mobile Phones", slug: "mobile-phones" },
  },
  {
    id: "prod-2",
    name: "MacBook Pro",
    slug: "macbook-pro",
    price: 1999.99,
    comparePrice: null,
    stock: 8,
    isActive: true,
    isFeatured: false,
    category: { id: "cat-2", name: "Laptops", slug: "laptops" },
  },
];

function makeRequest(url: string, init?: Record<string, unknown>): any {
  return {
    url,
    method: ((init?.method as string) || "GET").toUpperCase(),
    headers: { get: (_key: string) => null },
    json: async () => JSON.parse((init?.body as string) || "{}"),
  };
}

describe("GET /api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue(mockProducts);
    mockCount.mockResolvedValue(mockProducts.length);
  });

  it("returns products with success=true and meta", async () => {
    const req = makeRequest("http://localhost:3000/api/products");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProducts);
    expect(data.meta).toMatchObject({
      total: 2,
      page: 1,
      limit: 12,
      totalPages: 1,
    });
  });

  it("passes search param as OR filter to Prisma", async () => {
    const req = makeRequest("http://localhost:3000/api/products?search=iphone");
    await GET(req);

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toEqual([
      { name: { contains: "iphone", mode: "insensitive" } },
      { description: { contains: "iphone", mode: "insensitive" } },
      { brand: { contains: "iphone", mode: "insensitive" } },
    ]);
  });

  it("passes category slug filter to Prisma", async () => {
    const req = makeRequest("http://localhost:3000/api/products?category=laptops");
    await GET(req);

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.category).toEqual({ slug: "laptops" });
  });

  it("passes price range filters to Prisma", async () => {
    const req = makeRequest("http://localhost:3000/api/products?minPrice=100&maxPrice=500");
    await GET(req);

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.price).toMatchObject({ gte: 100, lte: 500 });
  });

  it("sorts by price ascending when sortBy=price-asc", async () => {
    const req = makeRequest("http://localhost:3000/api/products?sortBy=price-asc");
    await GET(req);

    const orderByArg = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderByArg).toEqual({ price: "asc" });
  });

  it("sorts by price descending when sortBy=price-desc", async () => {
    const req = makeRequest("http://localhost:3000/api/products?sortBy=price-desc");
    await GET(req);

    const orderByArg = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderByArg).toEqual({ price: "desc" });
  });

  it("sorts by rating when sortBy=rating", async () => {
    const req = makeRequest("http://localhost:3000/api/products?sortBy=rating");
    await GET(req);

    const orderByArg = mockFindMany.mock.calls[0][0].orderBy;
    expect(orderByArg).toEqual({ rating: "desc" });
  });

  it("paginates with correct skip and take values", async () => {
    const req = makeRequest("http://localhost:3000/api/products?page=2&limit=6");
    mockCount.mockResolvedValue(18);
    mockFindMany.mockResolvedValue([]);

    const res = await GET(req);
    const data = await res.json();

    const call = mockFindMany.mock.calls[0][0];
    expect(call.skip).toBe(6);
    expect(call.take).toBe(6);
    expect(data.meta.totalPages).toBe(3);
  });

  it("returns 500 when Prisma throws", async () => {
    mockFindMany.mockRejectedValue(new Error("DB Error"));
    const req = makeRequest("http://localhost:3000/api/products");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch products");
    expect(res.status).toBe(500);
  });
});

describe("POST /api/products", () => {
  const newProduct = {
    name: "Sony WH-1000XM5",
    price: 349.99,
    categoryId: "cat-audio",
    stock: 20,
    description: "Noise cancelling headphones",
    images: ["/sony.jpg"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({
      id: "prod-new",
      slug: "sony-wh-1000xm5",
      ...newProduct,
      category: { id: "cat-audio", name: "Audio", slug: "audio" },
    });
  });

  it("creates a product and returns 201", async () => {
    const req = makeRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(newProduct),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Sony WH-1000XM5");
    expect(res.status).toBe(201);
  });

  it("auto-generates a slug from the product name", async () => {
    const req = makeRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify({ ...newProduct, slug: undefined }),
    });

    await POST(req);

    const createArg = mockCreate.mock.calls[0][0];
    expect(createArg.data.slug).toBe("sony-wh-1000xm5");
  });

  it("returns 500 when Prisma create throws", async () => {
    mockCreate.mockRejectedValue(new Error("DB Error"));
    const req = makeRequest("http://localhost:3000/api/products", {
      method: "POST",
      body: JSON.stringify(newProduct),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to create product");
    expect(res.status).toBe(500);
  });
});