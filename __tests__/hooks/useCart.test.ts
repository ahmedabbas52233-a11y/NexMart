import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/hooks/useCart";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeCartItem(
  productId: string,
  price: number,
  quantity = 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return {
    id: `cart-${productId}`,
    userId: "user-1",
    productId,
    quantity,
    createdAt: new Date(),
    updatedAt: new Date(),
    product: {
      id: productId,
      name: `Product ${productId}`,
      slug: `product-${productId}`,
      description: "Test product",
      price,
      comparePrice: null,
      stock: 10,
      images: ["/test.jpg"],
      sku: `SKU-${productId}`,
      brand: "TestBrand",
      rating: 4.5,
      reviewCount: 12,
      isActive: true,
      isFeatured: false,
      categoryId: "cat-1",
      metaTitle: null,
      metaDesc: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: "cat-1",
        name: "Electronics",
        slug: "electronics",
        description: null,
        image: null,
        parentId: null,
        sortOrder: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    },
  };
}

// Reset store state before each test
beforeEach(() => {
  useCartStore.setState({ items: [], isLoading: false, isOpen: false });
});

// ─── setItems() ───────────────────────────────────────────────────────────────
describe("setItems()", () => {
  it("replaces the entire items array", () => {
    const items = [makeCartItem("p1", 29.99)];
    useCartStore.getState().setItems(items);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe("p1");
  });

  it("clears items when passed empty array", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10)]);
    useCartStore.getState().setItems([]);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── addItem() ────────────────────────────────────────────────────────────────
describe("addItem()", () => {
  it("adds a new item to empty cart", () => {
    useCartStore.getState().addItem(makeCartItem("p1", 29.99));
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("adds multiple different items", () => {
    useCartStore.getState().addItem(makeCartItem("p1", 10));
    useCartStore.getState().addItem(makeCartItem("p2", 20));
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("increments quantity when same product added again", () => {
    useCartStore.getState().addItem(makeCartItem("p1", 29.99, 1));
    useCartStore.getState().addItem(makeCartItem("p1", 29.99, 2));
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });
});

// ─── removeItem() ─────────────────────────────────────────────────────────────
describe("removeItem()", () => {
  it("removes item by productId", () => {
    useCartStore.getState().setItems([
      makeCartItem("p1", 10),
      makeCartItem("p2", 20),
    ]);
    useCartStore.getState().removeItem("p1");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe("p2");
  });

  it("is a no-op when productId not in cart", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10)]);
    useCartStore.getState().removeItem("non-existent");
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

// ─── updateQuantity() ─────────────────────────────────────────────────────────
describe("updateQuantity()", () => {
  it("updates the quantity of an existing item", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10, 1)]);
    useCartStore.getState().updateQuantity("p1", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes the item when quantity set to 0", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10, 2)]);
    useCartStore.getState().updateQuantity("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes the item when quantity is negative", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10, 2)]);
    useCartStore.getState().updateQuantity("p1", -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("leaves other items untouched", () => {
    useCartStore.getState().setItems([
      makeCartItem("p1", 10, 1),
      makeCartItem("p2", 20, 3),
    ]);
    useCartStore.getState().updateQuantity("p1", 4);
    const items = useCartStore.getState().items;
    expect(items.find((i) => i.productId === "p2")?.quantity).toBe(3);
  });
});

// ─── clearCart() ──────────────────────────────────────────────────────────────
describe("clearCart()", () => {
  it("removes all items from the cart", () => {
    useCartStore.getState().setItems([
      makeCartItem("p1", 10),
      makeCartItem("p2", 20),
    ]);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

// ─── setLoading() ─────────────────────────────────────────────────────────────
describe("setLoading()", () => {
  it("sets isLoading to true", () => {
    useCartStore.getState().setLoading(true);
    expect(useCartStore.getState().isLoading).toBe(true);
  });

  it("sets isLoading to false", () => {
    useCartStore.getState().setLoading(true);
    useCartStore.getState().setLoading(false);
    expect(useCartStore.getState().isLoading).toBe(false);
  });
});

// ─── toggleCart() / setCartOpen() ─────────────────────────────────────────────
describe("toggleCart()", () => {
  it("toggles isOpen from false to true", () => {
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("toggles isOpen back to false", () => {
    useCartStore.getState().toggleCart();
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});

describe("setCartOpen()", () => {
  it("sets isOpen to a specific value", () => {
    useCartStore.getState().setCartOpen(true);
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().setCartOpen(false);
    expect(useCartStore.getState().isOpen).toBe(false);
  });
});

// ─── totalItems() — computed ──────────────────────────────────────────────────
describe("totalItems()", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it("sums quantities across all items", () => {
    useCartStore.getState().setItems([
      makeCartItem("p1", 10, 2),
      makeCartItem("p2", 20, 3),
    ]);
    expect(useCartStore.getState().totalItems()).toBe(5);
  });

  it("counts a single item correctly", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 10, 7)]);
    expect(useCartStore.getState().totalItems()).toBe(7);
  });
});

// ─── totalPrice() — computed ──────────────────────────────────────────────────
describe("totalPrice()", () => {
  it("returns 0 for an empty cart", () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  it("calculates price × quantity for a single item", () => {
    useCartStore.getState().setItems([makeCartItem("p1", 29.99, 2)]);
    expect(useCartStore.getState().totalPrice()).toBeCloseTo(59.98);
  });

  it("sums totals across multiple items", () => {
    useCartStore.getState().setItems([
      makeCartItem("p1", 10, 2), // 20
      makeCartItem("p2", 15, 3), // 45
    ]);
    expect(useCartStore.getState().totalPrice()).toBeCloseTo(65);
  });
});
