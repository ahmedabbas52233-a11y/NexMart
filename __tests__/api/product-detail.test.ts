import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Define mock with explicit type BEFORE importing route
const mockFindFirst = vi.fn();
const mockPrisma = {
  product: {
    findFirst: mockFindFirst as Mock,
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { GET } from "@/app/api/products/[id]/route";

describe("GET /api/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns product by id", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Test Product",
      slug: "test-product",
      price: 99.99,
      isActive: true,
      category: { id: "cat-1", name: "Test" },
    };

    mockFindFirst.mockResolvedValue(mockProduct);

    const req = {
      url: "http://localhost:3000/api/products/prod-1",
    };

    const res = await GET(req as any, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.id).toBe("prod-1");
  });

  it("returns 404 when product not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const req = { url: "http://localhost:3000/api/products/nonexistent" };
    const res = await GET(req as any, { params: { id: "nonexistent" } });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
  });
});