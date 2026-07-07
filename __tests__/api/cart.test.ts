import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPrisma = {
  product: { findUnique: vi.fn() },
  cartItem: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { GET, POST, PATCH, DELETE } = await import("@/app/api/cart/route");

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/cart") {
  return new NextRequest(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/cart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await GET(makeRequest("GET"));
      expect(res.status).toBe(401);
    });

    it("returns cart items for an authenticated user", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.cartItem.findMany.mockResolvedValue([{ id: "item-1" }]);

      const res = await GET(makeRequest("GET"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
    });
  });

  describe("POST", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await POST(makeRequest("POST", { productId: "p1", quantity: 1 }));
      expect(res.status).toBe(401);
    });

    it("rejects when product does not exist", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const res = await POST(makeRequest("POST", { productId: "missing", quantity: 1 }));
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
    });

    it("rejects when requested quantity exceeds stock", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", isActive: true, stock: 5 });
      mockPrisma.cartItem.findUnique.mockResolvedValue(null);

      const res = await POST(makeRequest("POST", { productId: "p1", quantity: 10 }));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toMatch(/stock/i);
    });

    it("rejects when existing cart quantity + new quantity exceeds stock (cumulative check)", async () => {
      // Regression test: previously only the incremental amount was checked
      // against stock, so repeated small additions could oversell.
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", isActive: true, stock: 5 });
      mockPrisma.cartItem.findUnique.mockResolvedValue({ quantity: 4 });

      const res = await POST(makeRequest("POST", { productId: "p1", quantity: 2 }));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toMatch(/stock/i);
      expect(mockPrisma.cartItem.upsert).not.toHaveBeenCalled();
    });

    it("adds to cart when within stock", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", isActive: true, stock: 5 });
      mockPrisma.cartItem.findUnique.mockResolvedValue({ quantity: 1 });
      mockPrisma.cartItem.upsert.mockResolvedValue({ id: "item-1", quantity: 2 });

      const res = await POST(makeRequest("POST", { productId: "p1", quantity: 1 }));
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it("rejects invalid input via zod", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      const res = await POST(makeRequest("POST", { productId: "", quantity: -1 }));
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH", () => {
    it("removes the item when quantity is 0", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const res = await PATCH(makeRequest("PATCH", { productId: "p1", quantity: 0 }));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalled();
    });

    it("rejects when the new absolute quantity exceeds stock", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", isActive: true, stock: 3 });

      const res = await PATCH(makeRequest("PATCH", { productId: "p1", quantity: 10 }));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toMatch(/stock/i);
      expect(mockPrisma.cartItem.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE", () => {
    it("returns 401 when unauthenticated", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await DELETE(makeRequest("DELETE", undefined, "http://localhost/api/cart?productId=p1"));
      expect(res.status).toBe(401);
    });

    it("removes the item for an authenticated user", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

      const res = await DELETE(makeRequest("DELETE", undefined, "http://localhost/api/cart?productId=p1"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
