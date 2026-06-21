import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, limiters } from "@/lib/rate-limit";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Advance fake time by `ms` milliseconds */
function tick(ms: number) {
  vi.advanceTimersByTime(ms);
}

// ─── rateLimit() core logic ───────────────────────────────────────────────────
describe("rateLimit()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request and returns success=true", () => {
    const result = rateLimit("ip-1", {
      windowMs: 60_000,
      maxRequests: 5,
      prefix: "test-a",
    });
    expect(result.success).toBe(true);
  });

  it("tracks remaining count correctly after first request", () => {
    const result = rateLimit("ip-2", {
      windowMs: 60_000,
      maxRequests: 5,
      prefix: "test-b",
    });
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("allows requests up to the limit", () => {
    const config = { windowMs: 60_000, maxRequests: 3, prefix: "test-c" };
    const ip = "ip-3";

    const r1 = rateLimit(ip, config);
    const r2 = rateLimit(ip, config);
    const r3 = rateLimit(ip, config);

    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
    expect(r3.success).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const config = { windowMs: 60_000, maxRequests: 3, prefix: "test-d" };
    const ip = "ip-4";

    rateLimit(ip, config); // 1
    rateLimit(ip, config); // 2
    rateLimit(ip, config); // 3 — at limit
    const r4 = rateLimit(ip, config); // 4 — over limit

    expect(r4.success).toBe(false);
    expect(r4.remaining).toBe(0);
  });

  it("returns resetAt in the future", () => {
    const now = Date.now();
    const result = rateLimit("ip-5", {
      windowMs: 60_000,
      maxRequests: 5,
      prefix: "test-e",
    });
    expect(result.resetAt).toBeGreaterThan(now);
    expect(result.resetAt).toBeLessThanOrEqual(now + 60_000 + 10); // small tolerance
  });

  it("resets counter after window expires", () => {
    const config = { windowMs: 60_000, maxRequests: 2, prefix: "test-f" };
    const ip = "ip-6";

    rateLimit(ip, config); // 1
    rateLimit(ip, config); // 2
    const blocked = rateLimit(ip, config); // blocked
    expect(blocked.success).toBe(false);

    // Advance past the window
    tick(61_000);

    const afterReset = rateLimit(ip, config); // new window — should pass
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it("namespaces IPs per prefix — same IP, different prefix = separate limits", () => {
    const ip = "ip-7";

    rateLimit(ip, { windowMs: 60_000, maxRequests: 1, prefix: "ns-x" });
    const blocked = rateLimit(ip, { windowMs: 60_000, maxRequests: 1, prefix: "ns-x" });
    expect(blocked.success).toBe(false);

    // Different prefix — fresh limit
    const fresh = rateLimit(ip, { windowMs: 60_000, maxRequests: 1, prefix: "ns-y" });
    expect(fresh.success).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const config = { windowMs: 60_000, maxRequests: 1, prefix: "test-g" };

    rateLimit("ip-A", config); // consumes ip-A's quota
    const ipB = rateLimit("ip-B", config); // ip-B is a fresh bucket

    expect(ipB.success).toBe(true);
  });
});

// ─── Pre-configured limiters ──────────────────────────────────────────────────
describe("limiters.register()", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows 5 requests before blocking", () => {
    const ip = "reg-ip-1";
    const results = Array.from({ length: 6 }, () => limiters.register(ip));

    expect(results.slice(0, 5).every((r) => r.success)).toBe(true);
    expect(results[5].success).toBe(false);
  });

  it("blocks on the 6th attempt", () => {
    const ip = "reg-ip-2";
    for (let i = 0; i < 5; i++) limiters.register(ip);
    expect(limiters.register(ip).success).toBe(false);
  });

  it("resets after 15 minutes", () => {
    const ip = "reg-ip-3";
    for (let i = 0; i < 5; i++) limiters.register(ip);
    expect(limiters.register(ip).success).toBe(false);

    tick(15 * 60 * 1000 + 1);
    expect(limiters.register(ip).success).toBe(true);
  });
});

describe("limiters.login()", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows 10 login attempts before blocking", () => {
    const ip = "login-ip-1";
    const results = Array.from({ length: 11 }, () => limiters.login(ip));

    expect(results.slice(0, 10).every((r) => r.success)).toBe(true);
    expect(results[10].success).toBe(false);
  });
});

describe("limiters.api()", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows 30 API calls per minute", () => {
    const ip = "api-ip-1";
    const results = Array.from({ length: 31 }, () => limiters.api(ip));

    expect(results.slice(0, 30).every((r) => r.success)).toBe(true);
    expect(results[30].success).toBe(false);
  });
});
