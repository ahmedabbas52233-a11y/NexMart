import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPrisma = {
  product: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  category: { findUnique: vi.fn() },
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { GET: listProducts, POST: createProduct } = await import("@/app/api/products/route");
const {
  PATCH: updateProduct,
  DELETE: deleteProduct,
} = await import("@/app/api/products/[id]/route");

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/products") {
  return new NextRequest(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET (public list)", () => {
    it("returns products without requiring auth", async () => {
      mockPrisma.product.findMany.mockResolvedValue([{ id: "p1" }]);
      mockPrisma.product.count.mockResolvedValue(1);

      const res = await listProducts(makeRequest("GET"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockGetServerSession).not.toHaveBeenCalled();
    });
  });

  describe("POST (admin create)", () => {
    it("rejects unauthenticated requests", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await createProduct(makeRequest("POST", { name: "Test" }));
      expect(res.status).toBe(403);
    });

    it("rejects non-admin users", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "USER" } });
      const res = await createProduct(makeRequest("POST", { name: "Test" }));
      expect(res.status).toBe(403);
    });

    it("rejects invalid payloads for admins", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "ADMIN" } });
      const res = await createProduct(makeRequest("POST", { name: "A" }));
      expect(res.status).toBe(400);
    });

    it("creates a product for a valid admin payload", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "ADMIN" } });
      mockPrisma.category.findUnique.mockResolvedValue({ id: "cat1" });
      mockPrisma.product.findUnique.mockResolvedValue(null);
      mockPrisma.product.create.mockResolvedValue({ id: "p1", name: "Test Product" });

      const res = await createProduct(
        makeRequest("POST", {
          name: "Test Product",
          price: 19.99,
          stock: 10,
          categoryId: "cat1",
        })
      );
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
    });
  });

  describe("PATCH /api/products/[id] (admin update)", () => {
    it("rejects unauthenticated requests — this was previously unguarded entirely", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await updateProduct(makeRequest("PATCH", { price: 10 }), {
        params: { id: "p1" },
      });
      expect(res.status).toBe(403);
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it("rejects non-admin users", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "USER" } });
      const res = await updateProduct(makeRequest("PATCH", { price: 10 }), {
        params: { id: "p1" },
      });
      expect(res.status).toBe(403);
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it("allows admins to update", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "ADMIN" } });
      mockPrisma.product.update.mockResolvedValue({ id: "p1", price: 10 });

      const res = await updateProduct(makeRequest("PATCH", { price: 10 }), {
        params: { id: "p1" },
      });

      expect(res.status).toBe(200);
      expect(mockPrisma.product.update).toHaveBeenCalled();
    });
  });

  describe("DELETE /api/products/[id] (admin soft-delete)", () => {
    it("rejects unauthenticated requests — this was previously unguarded entirely", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await deleteProduct(makeRequest("DELETE"), { params: { id: "p1" } });
      expect(res.status).toBe(403);
      expect(mockPrisma.product.update).not.toHaveBeenCalled();
    });

    it("allows admins to soft-delete", async () => {
      mockGetServerSession.mockResolvedValue({ user: { role: "ADMIN" } });
      mockPrisma.product.update.mockResolvedValue({ id: "p1", isActive: false });

      const res = await deleteProduct(makeRequest("DELETE"), { params: { id: "p1" } });

      expect(res.status).toBe(200);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isActive: false } })
      );
    });
  });
});
