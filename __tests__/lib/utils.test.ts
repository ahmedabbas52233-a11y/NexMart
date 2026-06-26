import { describe, it, expect } from "vitest";
import {
  cn,
  formatPrice,
  calculateDiscount,
  slugify,
  truncate,
} from "@/lib/utils";

// ─── cn() ─────────────────────────────────────────────────────────────────────
describe("cn()", () => {
  it("merges two class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("strips falsy conditional values", () => {
    expect(cn("base", false && "skip", undefined, "end")).toBe("base end");
  });

  it("handles array and object class syntax from clsx", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("returns empty string when no classes provided", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatPrice() ────────────────────────────────────────────────────────────
describe("formatPrice()", () => {
  it("formats a number as USD with two decimal places", () => {
    expect(formatPrice(29.99)).toBe("$29.99");
  });

  it("formats a string price correctly", () => {
    expect(formatPrice("149.00")).toBe("$149.00");
  });

  it("formats zero as $0.00", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("adds comma separators for thousands", () => {
    expect(formatPrice(1299.99)).toBe("$1,299.99");
  });

  it("formats whole numbers with .00", () => {
    expect(formatPrice(50)).toBe("$50.00");
  });

  it("rounds to 2 decimal places", () => {
    // Intl.NumberFormat rounds 29.999 → $30.00
    expect(formatPrice(29.999)).toBe("$30.00");
  });
});

// ─── calculateDiscount() ──────────────────────────────────────────────────────
describe("calculateDiscount()", () => {
  it("calculates a 20% discount", () => {
    expect(calculateDiscount(80, 100)).toBe(20);
  });

  it("calculates a 50% discount", () => {
    expect(calculateDiscount(50, 100)).toBe(50);
  });

  it("returns null when comparePrice is null", () => {
    expect(calculateDiscount(80, null)).toBeNull();
  });

  it("returns null when comparePrice equals price (no discount)", () => {
    expect(calculateDiscount(100, 100)).toBeNull();
  });

  it("returns null when comparePrice is less than price", () => {
    expect(calculateDiscount(120, 100)).toBeNull();
  });

  it("rounds fractional percentages to nearest integer", () => {
    // (100 - 66.67) / 100 = 33.33% → rounds to 33
    expect(calculateDiscount(66.67, 100)).toBe(33);
  });

  it("handles large discounts", () => {
    expect(calculateDiscount(10, 1000)).toBe(99);
  });
});

// ─── slugify() ────────────────────────────────────────────────────────────────
describe("slugify()", () => {
  it("converts uppercase to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("product name here")).toBe("product-name-here");
  });

  it("removes special characters", () => {
    expect(slugify("iPhone 14 Pro!")).toBe("iphone-14-pro");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("collapses multiple spaces into a single hyphen", () => {
    expect(slugify("a  b")).toBe("a-b");
  });

  it("handles already-slug strings unchanged", () => {
    expect(slugify("already-a-slug")).toBe("already-a-slug");
  });
});

// ─── truncate() ───────────────────────────────────────────────────────────────
describe("truncate()", () => {
  it("returns the original string when within length", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("appends ellipsis when string exceeds length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("returns the original string at exactly the limit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("handles empty strings", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles limit of 0 — returns ellipsis only", () => {
    expect(truncate("Hello", 0)).toBe("...");
  });
});
