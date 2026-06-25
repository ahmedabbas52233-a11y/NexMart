import { describe, it, expect } from "vitest";
import { cn, formatPrice, calculateDiscount, slugify, truncate, serialize } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("p-2", "m-2")).toBe("p-2 m-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", true && "block")).toBe("base block");
  });
});

describe("formatPrice", () => {
  it("formats numbers as USD", () => {
    expect(formatPrice(99.99)).toBe("$99.99");
    expect(formatPrice(1000)).toBe("$1,000.00");
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles string inputs", () => {
    expect(formatPrice("49.99")).toBe("$49.99");
  });

  it("handles invalid input", () => {
    expect(formatPrice(NaN)).toBe("$0.00");
  });
});

describe("calculateDiscount", () => {
  it("calculates discount percentage", () => {
    expect(calculateDiscount(80, 100)).toBe(20);
    expect(calculateDiscount(349.99, 399.99)).toBe(13);
  });

  it("returns 0 when no compare price", () => {
    expect(calculateDiscount(100, null)).toBe(0);
  });

  it("returns 0 when compare price is lower", () => {
    expect(calculateDiscount(100, 80)).toBe(0);
  });
});

describe("slugify", () => {
  it("creates URL-safe slugs", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Sony WH-1000XM5")).toBe("sony-wh-1000xm5");
    expect(slugify("  Spaces  ")).toBe("spaces");
  });
});

describe("truncate", () => {
  it("truncates long text", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("Hi", 10)).toBe("Hi");
  });
});

describe("serialize", () => {
  it("converts Decimal to plain number", () => {
    // Mock Prisma Decimal-like object
    const decimalLike = {
      toNumber: () => 99.99,
      toString: () => "99.99",
    };
    const data = { price: decimalLike };
    const result = serialize(data);
    expect(typeof result.price).toBe("number");
    expect(result.price).toBe(99.99);
  });

  it("converts Date to string", () => {
    const now = new Date("2024-01-15");
    const result = serialize({ date: now });
    expect(typeof result.date).toBe("string");
    expect(result.date).toBe(now.toISOString());
  });
});