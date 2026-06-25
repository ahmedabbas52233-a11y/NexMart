import { describe, it, expect } from "vitest";
import { rateLimit, limiters } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const result = rateLimit("ip-1", { windowMs: 60000, maxRequests: 5 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.limit).toBe(5);
  });

  it("blocks requests over limit", () => {
    // Make 6 requests (1 over limit)
    for (let i = 0; i < 5; i++) {
      rateLimit("ip-2", { windowMs: 60000, maxRequests: 5 });
    }
    const result = rateLimit("ip-2", { windowMs: 60000, maxRequests: 5 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const result1 = rateLimit("ip-3", { windowMs: -1, maxRequests: 1 }); // expired window
    expect(result1.success).toBe(true);
  });
});

describe("limiters", () => {
  it("has register limiter", () => {
    const result = limiters.register("ip-1");
    expect(result.limit).toBe(5);
  });

  it("has login limiter", () => {
    const result = limiters.login("ip-1");
    expect(result.limit).toBe(10);
  });

  it("has api limiter", () => {
    const result = limiters.api("ip-1");
    expect(result.limit).toBe(30);
  });
});