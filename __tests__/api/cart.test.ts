import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PATCH, DELETE } from "@/app/api/cart/route";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/server", () => ({
  NextRequest: class MockNextRequest {
    url: string;
    method: string;
    private _body: string;

    constructor(url: string, init?: { method?: string; body?: string }) {
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

// Mock getServerSession from next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions (dependency of getServerSession call inside handler)
vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const mockPrisma = {
  cartItem: {
    findMany: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockSession = { user: { id: "user-1", email: "test@example.com", role: "USER" } };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRequest(url: string, init?: Record<string, unknown>): any {
  const { NextRequest } = require("next/server");
  return new NextRequest(url, init);
}

const mockCartItems = [
  {
    id: "cart-1",
    userId: "user-1",
    productId: "prod-1",
    quantity: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: "prod-1",
      name: "AirPods Pro",
      price: 249.99,
      images: ["/airpods.jpg"],
      category: { name: "Audio" },
    },
  },
];

const mockProduct = {
  id: "prod-1",
  name: "AirPods Pro",
  price: 249.99,
  stock: 50,
  isActive: true,
};

// ─── GET /api/cart ─────────────────────────────────────────────────────────────
describe("GET /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session exists", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe("Unauthorized");
    expect(res.status).toBe(401);
  });

  it("returns the user's cart items on success", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.cartItem.findMany.mockResolvedValue(mockCartItems);

    const req = makeRequest("http://localhost:3000/api/cart");
    const res = await GET(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].productId).toBe("prod-1");
  });

  it("filters cart items by the authenticated user's id", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.cartItem.findMany.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/cart");
    await GET(req);

    const whereArg = mockPrisma.cartItem.findMany.mock.calls[0][0].where;
    expect(whereArg.userId).toBe("user-1");
  });
});

// ─── POST /api/cart ────────────────────────────────────────────────────────────
describe("POST /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "prod-1" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when productId is missing from the body", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ quantity: 1 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Product ID is required");
  });

  it("returns 404 when product does not exist", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "nonexistent" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("Product not found");
  });

  it("returns 400 when requested quantity exceeds stock", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, stock: 3 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "prod-1", quantity: 10 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Insufficient stock");
  });

  it("upserts cart item on success and returns 201", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
    mockPrisma.cartItem.upsert.mockResolvedValue({
      ...mockCartItems[0],
      quantity: 1,
    });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "prod-1", quantity: 1 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockPrisma.cartItem.upsert).toHaveBeenCalledOnce();
  });
});

// ─── PATCH /api/cart ───────────────────────────────────────────────────────────
describe("PATCH /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 3 }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when productId or quantity missing", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1" }), // no quantity
    });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/required/i);
  });

  it("removes cart item when quantity is 0", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 0 }),
    });
    const res = await PATCH(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledOnce();
  });

  it("updates quantity when value is positive", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.cartItem.update.mockResolvedValue({ ...mockCartItems[0], quantity: 5 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 5 }),
    });
    const res = await PATCH(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.data.quantity).toBe(5);
  });
});

// ─── DELETE /api/cart ──────────────────────────────────────────────────────────
describe("DELETE /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost:3000/api/cart?productId=prod-1",
      { method: "DELETE" }
    );
    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when productId query param is missing", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Product ID is required");
  });

  it("deletes the cart item and returns success", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(mockSession);
    mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const req = makeRequest(
      "http://localhost:3000/api/cart?productId=prod-1",
      { method: "DELETE" }
    );
    const res = await DELETE(req);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", productId: "prod-1" },
    });
  });
});
