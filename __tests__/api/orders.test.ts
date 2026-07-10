import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

class MockPrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, { code }: { code: string }) {
    super(message);
    this.code = code;
    this.name = "PrismaClientKnownRequestError";
  }
}

vi.mock("@prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError: MockPrismaClientKnownRequestError },
}));

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockTx = {
  cartItem: { findMany: vi.fn(), deleteMany: vi.fn() },
  order: { create: vi.fn() },
  product: { updateMany: vi.fn() },
};

const mockPrisma = {
  order: { findMany: vi.fn(), findUnique: vi.fn() },
  $transaction: vi.fn(async (callback: (tx: typeof mockTx) => unknown) => callback(mockTx)),
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { GET: listOrders, POST: createOrder } = await import("@/app/api/orders/route");
const { GET: getOrder } = await import("@/app/api/orders/[id]/route");

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/orders") {
  return new NextRequest(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

const validAddress = {
  shippingName: "Jane Doe",
  shippingEmail: "jane@example.com",
  shippingAddress: "123 Main St",
  shippingCity: "Springfield",
  shippingState: "IL",
  shippingZip: "62701",
  shippingCountry: "United States",
};

describe("/api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback: (tx: typeof mockTx) => unknown) =>
      callback(mockTx)
    );
  });

  describe("GET", () => {
    it("rejects unauthenticated requests", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await listOrders(makeRequest("GET"));
      expect(res.status).toBe(401);
    });
  });

  describe("POST (checkout)", () => {
    it("rejects unauthenticated requests", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await createOrder(makeRequest("POST", validAddress));
      expect(res.status).toBe(401);
    });

    it("rejects an incomplete shipping address", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      const res = await createOrder(makeRequest("POST", { shippingName: "Jane" }));
      expect(res.status).toBe(400);
    });

    it("rejects checkout when the cart is empty", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockTx.cartItem.findMany.mockResolvedValue([]);

      const res = await createOrder(makeRequest("POST", validAddress));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toMatch(/empty/i);
    });

    it("rejects checkout when an item no longer has enough stock at read time", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockTx.cartItem.findMany.mockResolvedValue([
        {
          productId: "p1",
          quantity: 5,
          product: { id: "p1", name: "Widget", price: 10, stock: 2, isActive: true, images: [] },
        },
      ]);
      // The atomic guard is what actually decides this, not the read above —
      // simulate it correctly refusing to match a row with insufficient stock.
      mockTx.product.updateMany.mockResolvedValue({ count: 0 });

      const res = await createOrder(makeRequest("POST", validAddress));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Widget");
      expect(mockTx.order.create).not.toHaveBeenCalled();
    });

    it("rejects checkout when stock was consumed by a concurrent request between the read and the write (race condition regression test)", async () => {
      // This is the scenario a race condition produces: the initial read
      // sees enough stock (stock: 5, requesting 2), but by the time this
      // transaction's UPDATE runs, a concurrent checkout already consumed
      // it. The atomic `WHERE stock >= quantity` guard is what has to catch
      // this — the stale read alone would incorrectly allow it through.
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockTx.cartItem.findMany.mockResolvedValue([
        {
          productId: "p1",
          quantity: 2,
          product: { id: "p1", name: "Widget", price: 10, stock: 5, isActive: true, images: [] },
        },
      ]);
      mockTx.product.updateMany.mockResolvedValue({ count: 0 });

      const res = await createOrder(makeRequest("POST", validAddress));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Widget");
      expect(mockTx.order.create).not.toHaveBeenCalled();
      expect(mockTx.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it("creates an order, atomically decrements stock, and clears the cart on success", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockTx.cartItem.findMany.mockResolvedValue([
        {
          productId: "p1",
          quantity: 2,
          product: { id: "p1", name: "Widget", price: 10, stock: 5, isActive: true, images: ["img.jpg"] },
        },
      ]);
      mockTx.product.updateMany.mockResolvedValue({ count: 1 });
      mockTx.order.create.mockResolvedValue({ id: "order-1", orderNumber: "NM-TEST", items: [] });

      const res = await createOrder(makeRequest("POST", validAddress));
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      // The stock >= quantity condition must live in the WHERE clause of the
      // same atomic UPDATE as the decrement — that's what closes the race.
      expect(mockTx.product.updateMany).toHaveBeenCalledWith({
        where: { id: "p1", isActive: true, stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      });
      expect(mockTx.cartItem.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    });

    describe("idempotency (double-click / retry protection)", () => {
      const idempotencyKey = "550e8400-e29b-41d4-a716-446655440000";

      it("returns the existing order instead of creating a new one when the key was already used (sequential retry)", async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
        mockPrisma.order.findUnique.mockResolvedValue({ id: "order-1", orderNumber: "NM-TEST", items: [] });

        const res = await createOrder(makeRequest("POST", { ...validAddress, idempotencyKey }));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.data.id).toBe("order-1");
        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      });

      it("rejects an idempotency key that isn't a valid UUID", async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
        const res = await createOrder(
          makeRequest("POST", { ...validAddress, idempotencyKey: "not-a-uuid" })
        );
        expect(res.status).toBe(400);
      });

      it("passes the idempotency key through when creating a new order", async () => {
        mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockTx.cartItem.findMany.mockResolvedValue([
          {
            productId: "p1",
            quantity: 1,
            product: { id: "p1", name: "Widget", price: 10, stock: 5, isActive: true, images: [] },
          },
        ]);
        mockTx.product.updateMany.mockResolvedValue({ count: 1 });
        mockTx.order.create.mockResolvedValue({ id: "order-1", orderNumber: "NM-TEST", items: [] });

        await createOrder(makeRequest("POST", { ...validAddress, idempotencyKey }));

        expect(mockTx.order.create).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ idempotencyKey }) })
        );
      });

      it("returns the winning order when two simultaneous submissions race on the same key (true concurrency case)", async () => {
        // Regression test for the actual race: two requests both pass the
        // pre-check (neither sees an existing order yet), both start a
        // transaction, but the database's unique constraint on
        // idempotencyKey only lets one `order.create` succeed. This test
        // simulates being the loser of that race.
        mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
        mockPrisma.order.findUnique
          .mockResolvedValueOnce(null) // pre-check: no order yet
          .mockResolvedValueOnce({ id: "order-1", orderNumber: "NM-TEST", items: [] }); // post-P2002 lookup: winner's order

        mockTx.cartItem.findMany.mockResolvedValue([
          {
            productId: "p1",
            quantity: 1,
            product: { id: "p1", name: "Widget", price: 10, stock: 5, isActive: true, images: [] },
          },
        ]);
        mockTx.product.updateMany.mockResolvedValue({ count: 1 });

        const p2002 = new MockPrismaClientKnownRequestError("Unique constraint failed", {
          code: "P2002",
        });
        mockPrisma.$transaction.mockRejectedValueOnce(p2002);

        const res = await createOrder(makeRequest("POST", { ...validAddress, idempotencyKey }));
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe("order-1");
      });
    });
  });

  describe("GET /api/orders/[id] (ownership check)", () => {
    it("rejects unauthenticated requests", async () => {
      mockGetServerSession.mockResolvedValue(null);
      const res = await getOrder(makeRequest("GET"), { params: { id: "order-1" } });
      expect(res.status).toBe(401);
    });

    it("returns 404 when the order doesn't exist", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
      mockPrisma.order.findUnique.mockResolvedValue(null);

      const res = await getOrder(makeRequest("GET"), { params: { id: "missing" } });
      expect(res.status).toBe(404);
    });

    it("rejects access to another user's order", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1", role: "USER" } });
      mockPrisma.order.findUnique.mockResolvedValue({ id: "order-1", userId: "someone-else" });

      const res = await getOrder(makeRequest("GET"), { params: { id: "order-1" } });
      expect(res.status).toBe(403);
    });

    it("allows an admin to view any order", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } });
      mockPrisma.order.findUnique.mockResolvedValue({ id: "order-1", userId: "someone-else" });

      const res = await getOrder(makeRequest("GET"), { params: { id: "order-1" } });
      expect(res.status).toBe(200);
    });

    it("allows the owning user to view their own order", async () => {
      mockGetServerSession.mockResolvedValue({ user: { id: "user-1", role: "USER" } });
      mockPrisma.order.findUnique.mockResolvedValue({ id: "order-1", userId: "user-1" });

      const res = await getOrder(makeRequest("GET"), { params: { id: "order-1" } });
      expect(res.status).toBe(200);
    });
  });
});
