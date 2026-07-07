import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductCard } from "@/components/product/product-card";

vi.mock("@/hooks/useCartAPI", () => ({
  useCartAPI: () => ({
    addToCart: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useWishlist", () => ({
  useWishlist: () => ({
    toggle: vi.fn(),
    isSaved: () => false,
    loading: false,
  }),
}));

function makeProduct(overrides = {}) {
  return {
    id: "prod-1",
    name: "Test Product",
    slug: "test-product",
    price: 99.99,
    stock: 10,
    images: ["https://example.com/image.jpg"],
    category: { name: "Audio", slug: "audio" },
    ...overrides,
  };
}

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders category name", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("Audio")).toBeInTheDocument();
  });

  it("renders price", () => {
    render(<ProductCard product={makeProduct()} />);
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders out of stock state", () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />);
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });
});