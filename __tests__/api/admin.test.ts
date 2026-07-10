import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPrisma = {
  order: { findMany: vi.fn(), count: vi.fn(), update: vi.fn() },
  user: { findMany: vi.fn(), count: vi.fn() },
  product: { count: vi.fn() },
  orderItem: { findMany: vi.fn() },
};
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const mockPut = vi.fn();
vi.mock("@vercel/blob", () => ({ put: (...args: unknown[]) => mockPut(...args) }));

function makeRequest(method: string, url: string, body?: unknown) {
  return new NextRequest(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

const ADMIN_SESSION = { user: { id: "admin-1", role: "ADMIN" } };
const USER_SESSION = { user: { id: "user-1", role: "USER" } };

const { GET: listOrders } = await import("@/app/api/admin/orders/route");
const { PATCH: updateOrder } = await import("@/app/api/admin/orders/[id]/route");
const { GET: listCustomers } = await import("@/app/api/admin/customers/route");
const { GET: getAnalytics } = await import("@/app/api/admin/analytics/route");
const { POST: uploadImage } = await import("@/app/api/admin/upload/route");

describe("/api/admin/orders", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("GET rejects non-admins", async () => {
    mockGetServerSession.mockResolvedValue(USER_SESSION);
    const res = await listOrders(makeRequest("GET", "http://localhost/api/admin/orders"));
    expect(res.status).toBe(403);
  });

  it("GET returns paginated orders with accurate stats for admins", async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.order.findMany
      .mockResolvedValueOnce([{ id: "o1" }]) // paginated page
      .mockResolvedValueOnce([{ total: 100 }, { total: 50 }]); // revenue rows
    mockPrisma.order.count
      .mockResolvedValueOnce(1) // total
      .mockResolvedValueOnce(0) // pending
      .mockResolvedValueOnce(1); // delivered

    const res = await listOrders(makeRequest("GET", "http://localhost/api/admin/orders?page=1&limit=50"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.pagination).toBeDefined();
    expect(data.stats.revenue).toBe(150);
  });

  it("PATCH rejects non-admins", async () => {
    mockGetServerSession.mockResolvedValue(USER_SESSION);
    const res = await updateOrder(makeRequest("PATCH", "http://localhost/api/admin/orders/o1", { status: "SHIPPED" }), {
      params: { id: "o1" },
    });
    expect(res.status).toBe(403);
  });

  it("PATCH rejects an invalid status value", async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    const res = await updateOrder(makeRequest("PATCH", "http://localhost/api/admin/orders/o1", { status: "NOT_REAL" }), {
      params: { id: "o1" },
    });
    expect(res.status).toBe(400);
  });

  it("PATCH updates order status for admins", async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.order.update.mockResolvedValue({ id: "o1", status: "SHIPPED" });

    const res = await updateOrder(makeRequest("PATCH", "http://localhost/api/admin/orders/o1", { status: "SHIPPED" }), {
      params: { id: "o1" },
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data.status).toBe("SHIPPED");
  });
});

describe("/api/admin/customers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rejects non-admins", async () => {
    mockGetServerSession.mockResolvedValue(USER_SESSION);
    const res = await listCustomers(makeRequest("GET", "http://localhost/api/admin/customers"));
    expect(res.status).toBe(403);
  });

  it("returns customers with computed order count and total spent, excluding cancelled orders", async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.user.findMany.mockResolvedValue([
      {
        id: "u1",
        name: "Jane",
        email: "jane@example.com",
        image: null,
        role: "USER",
        createdAt: new Date(),
        orders: [
          { total: 50, status: "DELIVERED" },
          { total: 999, status: "CANCELLED" },
        ],
      },
    ]);
    mockPrisma.user.count.mockResolvedValue(1);

    const res = await listCustomers(makeRequest("GET", "http://localhost/api/admin/customers?page=1&limit=50"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data[0].orderCount).toBe(2);
    expect(data.data[0].totalSpent).toBe(50); // cancelled order excluded
    expect(data.pagination.total).toBe(1);
  });
});

describe("/api/admin/analytics", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rejects non-admins", async () => {
    mockGetServerSession.mockResolvedValue(USER_SESSION);
    const res = await getAnalytics(makeRequest("GET", "http://localhost/api/admin/analytics"));
    expect(res.status).toBe(403);
  });

  it("computes per-product revenue as price * quantity, not raw summed price", async () => {
    // Regression test: an earlier draft used Prisma's groupBy `_sum` on the
    // raw `price` column directly, which sums per-unit prices across rows
    // instead of price * quantity — silently wrong revenue for any product
    // with quantity != 1. This asserts the corrected manual aggregation.
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockPrisma.order.findMany.mockResolvedValue([{ total: 100, createdAt: new Date(), status: "DELIVERED" }]);
    mockPrisma.orderItem.findMany.mockResolvedValue([
      { productName: "Widget", price: 10, quantity: 3 },
      { productName: "Widget", price: 10, quantity: 2 },
    ]);
    mockPrisma.user.count.mockResolvedValue(5);
    mockPrisma.product.count.mockResolvedValue(12);

    const res = await getAnalytics(makeRequest("GET", "http://localhost/api/admin/analytics"));
    const data = await res.json();

    expect(res.status).toBe(200);
    const widget = data.data.topProducts.find((p: { name: string }) => p.name === "Widget");
    expect(widget.quantity).toBe(5);
    expect(widget.revenue).toBe(50); // 10*3 + 10*2, not 10+10
  });
});

describe("/api/admin/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  it("rejects non-admins", async () => {
    mockGetServerSession.mockResolvedValue(USER_SESSION);
    const req = new NextRequest("http://localhost/api/admin/upload", { method: "POST" });
    const res = await uploadImage(req);
    expect(res.status).toBe(403);
  });

  it("returns a clear error when Vercel Blob isn't configured", async () => {
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    const req = new NextRequest("http://localhost/api/admin/upload", { method: "POST" });
    const res = await uploadImage(req);
    const data = await res.json();

    expect(res.status).toBe(501);
    expect(data.error).toMatch(/not configured|BLOB_READ_WRITE_TOKEN/i);
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("rejects a disallowed file type when configured", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);

    const formData = new FormData();
    formData.append("file", new File(["data"], "malware.exe", { type: "application/x-msdownload" }));

    const req = new NextRequest("http://localhost/api/admin/upload", { method: "POST" });
    vi.spyOn(req, "formData").mockResolvedValue(formData);

    const res = await uploadImage(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/JPEG|PNG|WebP|GIF/i);
  });

  it("uploads a valid image when configured", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    mockGetServerSession.mockResolvedValue(ADMIN_SESSION);
    mockPut.mockResolvedValue({ url: "https://blob.vercel-storage.com/products/test.jpg" });

    const formData = new FormData();
    formData.append("file", new File(["data"], "product.jpg", { type: "image/jpeg" }));

    const req = new NextRequest("http://localhost/api/admin/upload", { method: "POST" });
    vi.spyOn(req, "formData").mockResolvedValue(formData);

    const res = await uploadImage(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.data.url).toContain("blob.vercel-storage.com");
  });
});
