import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  GET,
  PATCH,
  DELETE,
} from "@/app/api/products/[id]/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    private _body: string;

    constructor(
      url: string,
      init?: { method?: string; body?: string }
    ) {
      this.url = url;
      this.method = (init?.method || "GET").toUpperCase();
      this._body = (init?.body as string) || "{}";
    }

    async json() {
      return JSON.parse(this._body);
    }
  },
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

const mockProduct = {
  id: "prod-1",
  name: "Samsung Galaxy S24",
  slug: "samsung-galaxy-s24",
  price: 799.99,
  comparePrice: 899.99,
  stock: 25,
  images: ["/galaxy.jpg"],
  isActive: true,
  isFeatured: true,
  category: { id: "cat-1", name: "Mobile Phones", slug: "mobile-phones" },
};

const mockPrisma = {
  product: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRequest(url: string, init?: Record<string, unknown>): any {
  const { NextRequest } = require("next/server");
  return new NextRequest(url, init);
}

// ─── GET /api/products/[id] ───────────────────────────────────────────────────
describe("GET /api/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
  });

  it("returns the product on success", async () => {
    const req = makeRequest("http://localhost:3000/api/products/prod-1");
    const res = await GET(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.name).toBe("Samsung Galaxy S24");
    expect(res.status).toBe(200);
  });

  it("queries by id OR slug", async () => {
    const req = makeRequest(
      "http://localhost:3000/api/products/samsung-galaxy-s24"
    );
    await GET(req, { params: { id: "samsung-galaxy-s24" } });

    const whereArg = mockPrisma.product.findFirst.mock.calls[0][0].where;
    expect(whereArg.OR).toEqual([
      { id: "samsung-galaxy-s24" },
      { slug: "samsung-galaxy-s24" },
    ]);
  });

  it("returns 404 when product not found", async () => {
    mockPrisma.product.findFirst.mockResolvedValue(null);
    const req = makeRequest("http://localhost:3000/api/products/nonexistent");
    const res = await GET(req, { params: { id: "nonexistent" } });
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Product not found");
    expect(res.status).toBe(404);
  });

  it("returns 500 on database error", async () => {
    mockPrisma.product.findFirst.mockRejectedValue(new Error("DB down"));
    const req = makeRequest("http://localhost:3000/api/products/prod-1");
    const res = await GET(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(res.status).toBe(500);
  });
});

// ─── PATCH /api/products/[id] ─────────────────────────────────────────────────
describe("PATCH /api/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.product.update.mockResolvedValue({
      ...mockProduct,
      price: 749.99,
      stock: 30,
    });
  });

  it("updates product fields and returns updated data", async () => {
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "PATCH",
      body: JSON.stringify({ price: 749.99, stock: 30 }),
    });

    const res = await PATCH(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.price).toBe(749.99);
    expect(data.data.stock).toBe(30);
  });

  it("calls Prisma update with the correct id", async () => {
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Updated Name" }),
    });
    await PATCH(req, { params: { id: "prod-1" } });

    const updateArg = mockPrisma.product.update.mock.calls[0][0];
    expect(updateArg.where).toEqual({ id: "prod-1" });
    expect(updateArg.data.name).toBe("Updated Name");
  });

  it("returns 500 on database error", async () => {
    mockPrisma.product.update.mockRejectedValue(new Error("DB error"));
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "PATCH",
      body: JSON.stringify({ price: 100 }),
    });
    const res = await PATCH(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(res.status).toBe(500);
  });
});

// ─── DELETE /api/products/[id] ────────────────────────────────────────────────
describe("DELETE /api/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.product.update.mockResolvedValue({
      ...mockProduct,
      isActive: false,
    });
  });

  it("soft-deletes the product (sets isActive=false)", async () => {
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.isActive).toBe(false);
  });

  it("calls Prisma update with isActive:false — not a hard delete", async () => {
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "DELETE",
    });
    await DELETE(req, { params: { id: "prod-1" } });

    const updateArg = mockPrisma.product.update.mock.calls[0][0];
    expect(updateArg.data).toEqual({ isActive: false });
    expect(updateArg.where).toEqual({ id: "prod-1" });
  });

  it("returns 500 on database error", async () => {
    mockPrisma.product.update.mockRejectedValue(new Error("DB error"));
    const req = makeRequest("http://localhost:3000/api/products/prod-1", {
      method: "DELETE",
    });
    const res = await DELETE(req, { params: { id: "prod-1" } });
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(res.status).toBe(500);
  });
});
