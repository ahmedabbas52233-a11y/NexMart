import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// Define mocks with explicit types BEFORE importing route
const mockCartFindMany = vi.fn();
const mockCartFindUnique = vi.fn();
const mockCartUpdate = vi.fn();
const mockCartUpdateMany = vi.fn();
const mockCartDeleteMany = vi.fn();
const mockCartCreate = vi.fn();
const mockProductFindUnique = vi.fn();

const mockPrisma = {
  cartItem: {
    findMany: mockCartFindMany as Mock,
    findUnique: mockCartFindUnique as Mock,
    update: mockCartUpdate as Mock,
    updateMany: mockCartUpdateMany as Mock,
    deleteMany: mockCartDeleteMany as Mock,
    create: mockCartCreate as Mock,
  },
  product: {
    findUnique: mockProductFindUnique as Mock,
  },
};

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { GET, POST, PATCH, DELETE } from "@/app/api/cart/route";
import { getServerSession } from "next-auth";

const mockSession = { user: { id: "user-1", email: "test@example.com", role: "USER" } };

function makeRequest(url: string, init?: Record<string, unknown>): any {
  return {
    url,
    method: ((init?.method as string) || "GET").toUpperCase(),
    headers: { get: (_key: string) => null },
    json: async () => JSON.parse((init?.body as string) || "{}"),
  };
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

describe("GET /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session exists", async () => {
    (getServerSession as Mock).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart");
    const res = await GET(req);
    const data = await res.json();

    expect(data.error).toBe("Unauthorized");
    expect(res.status).toBe(401);
  });

  it("returns the user's cart items on success", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockCartFindMany.mockResolvedValue(mockCartItems);

    const req = makeRequest("http://localhost:3000/api/cart");
    const res = await GET(req);
    const data = await res.json();

    expect(data).toHaveLength(1);
    expect(data[0].productId).toBe("prod-1");
  });

  it("filters cart items by the authenticated user's id", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockCartFindMany.mockResolvedValue([]);

    const req = makeRequest("http://localhost:3000/api/cart");
    await GET(req);

    const whereArg = mockCartFindMany.mock.calls[0][0].where;
    expect(whereArg.userId).toBe("user-1");
  });
});

describe("POST /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    (getServerSession as Mock).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "prod-1" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 404 when product does not exist", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockProductFindUnique.mockResolvedValue(null);

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
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockProductFindUnique.mockResolvedValue({ ...mockProduct, stock: 3 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId: "prod-1", quantity: 10 }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Insufficient stock");
  });

  it("creates cart item on success and returns 201", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockProductFindUnique.mockResolvedValue(mockProduct);
    mockCartFindUnique.mockResolvedValue(null);
    mockCartCreate.mockResolvedValue({
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
    expect(data.productId).toBe("prod-1");
  });
});

describe("PATCH /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    (getServerSession as Mock).mockResolvedValue(null);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 3 }),
    });
    const res = await PATCH(req);

    expect(res.status).toBe(401);
  });

  it("removes cart item when quantity is 0", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockCartDeleteMany.mockResolvedValue({ count: 1 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 0 }),
    });
    const res = await PATCH(req);
    const data = await res.json();

    expect(data.message).toBe("Item removed");
  });

  it("updates quantity when value is positive", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockCartUpdateMany.mockResolvedValue({ count: 1 });

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "PATCH",
      body: JSON.stringify({ productId: "prod-1", quantity: 5 }),
    });
    const res = await PATCH(req);
    const data = await res.json();

    expect(data.updated).toBe(1);
  });
});

describe("DELETE /api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    (getServerSession as Mock).mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost:3000/api/cart?productId=prod-1",
      { method: "DELETE" }
    );
    const res = await DELETE(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when productId query param is missing", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);

    const req = makeRequest("http://localhost:3000/api/cart", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Product ID is required");
  });

  it("deletes the cart item and returns success", async () => {
    (getServerSession as Mock).mockResolvedValue(mockSession);
    mockCartDeleteMany.mockResolvedValue({ count: 1 });

    const req = makeRequest(
      "http://localhost:3000/api/cart?productId=prod-1",
      { method: "DELETE" }
    );
    const res = await DELETE(req);
    const data = await res.json();

    expect(data.message).toBe("Item removed");
  });
});