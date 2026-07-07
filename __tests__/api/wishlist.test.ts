import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetServerSession = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockPrisma = {
  product: { findUnique: vi.fn() },
  wishlistItem: { findMany: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
};

vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { GET, POST, DELETE } = await import("@/app/api/wishlist/route");

function makeRequest(method: string, body?: unknown, url = "http://localhost/api/wishlist") {
  return new NextRequest(url, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/wishlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET rejects unauthenticated requests", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });

  it("POST rejects unauthenticated requests", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest("POST", { productId: "p1" }));
    expect(res.status).toBe(401);
  });

  it("POST rejects a nonexistent product", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest("POST", { productId: "missing" }));
    expect(res.status).toBe(404);
  });

  it("POST adds a product to the wishlist idempotently", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.product.findUnique.mockResolvedValue({ id: "p1" });
    mockPrisma.wishlistItem.upsert.mockResolvedValue({ id: "wish-1", productId: "p1" });

    const res = await POST(makeRequest("POST", { productId: "p1" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(mockPrisma.wishlistItem.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: {} })
    );
  });

  it("DELETE requires a productId query param", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(400);
  });

  it("DELETE removes the item for the authenticated user", async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mockPrisma.wishlistItem.deleteMany.mockResolvedValue({ count: 1 });

    const res = await DELETE(makeRequest("DELETE", undefined, "http://localhost/api/wishlist?productId=p1"));
    expect(res.status).toBe(200);
    expect(mockPrisma.wishlistItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", productId: "p1" },
    });
  });
});
