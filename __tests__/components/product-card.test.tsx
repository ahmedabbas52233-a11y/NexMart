import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ProductCard from "@/components/product/ProductCard";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAddToCart = vi.fn();

vi.mock("@/hooks/useCartAPI", () => ({
  useCartAPI: () => ({
    addToCart: mockAddToCart,
  }),
}));

vi.mock("lucide-react", () => ({
  Heart: () => React.createElement("span", { "data-testid": "heart-icon" }),
  ShoppingCart: () => React.createElement("span", { "data-testid": "cart-icon" }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeProduct(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "prod-1",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    price: 349.99,
    comparePrice: null,
    stock: 10,
    images: ["/sony.jpg"],
    rating: 4.5,
    reviewCount: 128,
    category: { name: "Audio" },
    ...overrides,
  };
}

// ─── Render tests ─────────────────────────────────────────────────────────────
describe("ProductCard — rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the product name", () => {
    render(<ProductCard product={makeProduct() as any} />);
    expect(screen.getByText("Sony WH-1000XM5")).toBeInTheDocument();
  });

  it("renders the formatted price", () => {
    render(<ProductCard product={makeProduct() as any} />);
    expect(screen.getByText("$349.99")).toBeInTheDocument();
  });

  it("renders product image with correct alt text", () => {
    render(<ProductCard product={makeProduct() as any} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Sony WH-1000XM5");
  });

  it("links to the product detail page", () => {
    render(<ProductCard product={makeProduct() as any} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/product/sony-wh-1000xm5");
  });
});

describe("ProductCard — discount badge", () => {
  it("shows discount badge when comparePrice is set", () => {
    render(<ProductCard product={makeProduct({ comparePrice: 499.99 }) as any} />);
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
  });

  it("does NOT show discount badge when comparePrice is null", () => {
    render(<ProductCard product={makeProduct() as any} />);
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });
});

describe("ProductCard — out of stock", () => {
  it("shows 'Out of Stock' overlay when stock is 0", () => {
    render(<ProductCard product={makeProduct({ stock: 0 }) as any} />);
    // Use getAllByText since both overlay and button have "Out of Stock"
    const outOfStockElements = screen.getAllByText("Out of Stock");
    expect(outOfStockElements.length).toBeGreaterThanOrEqual(1);
  });

  it("disables the Add to Cart button when out of stock", () => {
    render(<ProductCard product={makeProduct({ stock: 0 }) as any} />);
    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();
  });
});

describe("ProductCard — add to cart", () => {
  it("calls addToCart with the product id when button clicked", () => {
    render(<ProductCard product={makeProduct() as any} />);
    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);
    expect(mockAddToCart).toHaveBeenCalledWith("prod-1", 1);
  });

  it("does not call addToCart when product is out of stock", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={makeProduct({ stock: 0 }) as any} />);
    const button = screen.getByRole("button", { name: /out of stock/i });
    await user.click(button);
    expect(mockAddToCart).not.toHaveBeenCalled();
  });
});