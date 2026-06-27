import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ProductCard } from "@/components/product/product-card";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockAddToCart = vi.fn();

vi.mock("@/hooks/useCartAPI", () => ({
  useCartAPI: () => ({
    addToCart: mockAddToCart,
    isLoading: false,
  }),
}));

// lucide-react icons are SVGs — render as empty spans to keep tests simple
vi.mock("lucide-react", () => ({
  Heart: () => React.createElement("span", { "data-testid": "heart-icon" }),
  ShoppingCart: () => React.createElement("span", { "data-testid": "cart-icon" }),
  Star: ({ className }: { className: string }) =>
    React.createElement("span", { "data-testid": "star", className }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeProduct(overrides: Record<string, unknown> = {}): any {
  return {
    id: "prod-1",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise cancelling headphones",
    price: 349.99,
    comparePrice: null,
    stock: 10,
    images: ["/sony.jpg"],
    sku: "SONY-XM5",
    brand: "Sony",
    rating: 4.5,
    reviewCount: 128,
    isActive: true,
    isFeatured: true,
    categoryId: "cat-audio",
    metaTitle: null,
    metaDesc: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: "cat-audio",
      name: "Audio",
      slug: "audio",
      description: null,
      image: null,
      parentId: null,
      sortOrder: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    ...overrides,
  };
}

// ─── Render tests ─────────────────────────────────────────────────────────────
describe("ProductCard — rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the product name", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("Sony WH-1000XM5")).toBeInTheDocument();
  });

  it("renders the category name", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("renders the formatted price", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("$349.99")).toBeInTheDocument();
  });

  it("renders the review count", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("(128)")).toBeInTheDocument();
  });

  it("renders five star icons", () => {
    render(<ProductCard product={makeProduct()} />);
    const stars = screen.getAllByTestId("star");
    expect(stars).toHaveLength(5);
  });

  it("renders product image with correct alt text", () => {
    render(<ProductCard product={makeProduct()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", "Sony WH-1000XM5");
    expect(img).toHaveAttribute("src", "/sony.jpg");
  });

  it("links product image and name to the product detail page", () => {
    render(<ProductCard product={makeProduct()} />);
    const links = screen.getAllByRole("link");
    links.forEach((link: HTMLElement) => {
      expect(link).toHaveAttribute("href", "/product/sony-wh-1000xm5");
    });
  });
});

// ─── Discount badge ────────────────────────────────────────────────────────────
describe("ProductCard — discount badge", () => {
  it("shows discount badge when comparePrice is set", () => {
    // 349.99 vs 499.99 = ~30% off
    render(
      <ProductCard
        product={makeProduct({ price: 349.99, comparePrice: 499.99 })}
      />
    );
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
  });

  it("shows the strikethrough comparePrice", () => {
    render(
      <ProductCard
        product={makeProduct({ price: 349.99, comparePrice: 499.99 })}
      />
    );
    expect(screen.getByText("$499.99")).toBeInTheDocument();
  });

  it("does NOT show discount badge when comparePrice is null", () => {
    render(<ProductCard product={makeProduct({ comparePrice: null })} />);
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it("does NOT show discount badge when comparePrice equals price", () => {
    render(
      <ProductCard
        product={makeProduct({ price: 349.99, comparePrice: 349.99 })}
      />
    );
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });
});

// ─── Out-of-stock state ────────────────────────────────────────────────────────
describe("ProductCard — out of stock", () => {
  it("shows 'Out of Stock' overlay when stock is 0", () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />);
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("disables the Add to Cart button when out of stock", () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />);
    // Button shows "Unavailable" when out of stock (overlay shows "Out of Stock")
    const button = screen.getByRole("button", { name: /out of stock/i });
    expect(button).toBeDisabled();
  });

  it("shows 'Add to Cart' text when in stock", () => {
    render(<ProductCard product={makeProduct({ stock: 5 })} />);
    expect(
      screen.getByRole("button", { name: /add to cart/i })
    ).toBeInTheDocument();
  });
});

// ─── Add to cart interaction ───────────────────────────────────────────────────
describe("ProductCard — add to cart", () => {
  it("calls addToCart with the product id when button clicked", () => {
    render(<ProductCard product={makeProduct()} />);
    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);
    expect(mockAddToCart).toHaveBeenCalledWith("prod-1");
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });

  it("does not call addToCart when product is out of stock", () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />);
    const button = screen.getByRole("button", { name: /out of stock/i });
    // onClick guard prevents addToCart call regardless of how click fires
    fireEvent.click(button);
    expect(mockAddToCart).not.toHaveBeenCalled();
  });
});

// ─── Compact variant ──────────────────────────────────────────────────────────
describe("ProductCard — compact variant", () => {
  it("renders without error in compact mode", () => {
    expect(() =>
      render(<ProductCard product={makeProduct()} variant="compact" />)
    ).not.toThrow();
  });
});
