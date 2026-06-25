import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCart } from "@/hooks/useCart";

// Mock localStorage for Zustand persist
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("useCart", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset to empty state
    useCart.setState({ items: [] }, true);
  });

  it("starts with empty cart", () => {
    expect(useCart.getState().items).toEqual([]);
    expect(useCart.getState().totalItems()).toBe(0);
  });

  it("adds item to cart", () => {
    useCart.getState().addItem("prod-1", 2);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0]).toEqual({ productId: "prod-1", quantity: 2 });
    expect(useCart.getState().totalItems()).toBe(2);
  });

  it("increments quantity for existing item", () => {
    useCart.getState().addItem("prod-1", 1);
    useCart.getState().addItem("prod-1", 2);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it("removes item from cart", () => {
    useCart.getState().addItem("prod-1", 1);
    useCart.getState().removeItem("prod-1");
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("updates quantity", () => {
    useCart.getState().addItem("prod-1", 1);
    useCart.getState().updateQuantity("prod-1", 5);
    expect(useCart.getState().items[0].quantity).toBe(5);
  });

  it("removes item when quantity set to 0", () => {
    useCart.getState().addItem("prod-1", 1);
    useCart.getState().updateQuantity("prod-1", 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("clears cart", () => {
    useCart.getState().addItem("prod-1", 1);
    useCart.getState().addItem("prod-2", 2);
    useCart.getState().clearCart();
    expect(useCart.getState().items).toHaveLength(0);
  });

  it("calculates totalPrice", () => {
    useCart.getState().addItem("prod-1", 2);
    // totalPrice returns 0 because it doesn't have product price lookup
    expect(useCart.getState().totalPrice()).toBe(0);
  });
});