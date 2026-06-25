import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductCard from "@/components/product/ProductCard";
import { useCart } from "@/hooks/useCart";

// Mock the cart hook
vi.mock("@/hooks/useCart", () => ({
  useCart: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  slug: "test-product",
  price: 99.99,
  comparePrice: 149.99,
  images: ["https://example.com/image.jpg"],
  rating: 4.5,
  reviewCount: 128,
  stock: 10,
  category: { name: "Electronics" },
};

describe("ProductCard", () => {
  const addItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCart as any).mockReturnValue({ addItem });
  });

  it("renders product information correctly", () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("$149.99")).toBeInTheDocument();
    expect(screen.getByText("(128)")).toBeInTheDocument();
  });

  it("shows discount badge when comparePrice exists", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(/-33%/)).toBeInTheDocument();
  });

  it("disables add to cart when out of stock", () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    expect(button).toBeDisabled();
  });

  it("calls addItem when add to cart is clicked", () => {
    render(<ProductCard product={mockProduct} />);

    const button = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(button);

    expect(addItem).toHaveBeenCalledWith("prod-1", 1);
  });

  it("does NOT call addItem when clicking the card (only on button)", () => {
    render(<ProductCard product={mockProduct} />);

    // Click on the product name/link area - should NOT add to cart
    const productLink = screen.getByText("Test Product");
    fireEvent.click(productLink);

    // addItem should NOT be called from the link click
    expect(addItem).not.toHaveBeenCalled();
  });

  it("renders in list view mode", () => {
    render(<ProductCard product={mockProduct} viewMode="list" />);

    expect(screen.getByText("Free Shipping")).toBeInTheDocument();
    expect(screen.getByText("View details")).toBeInTheDocument();
  });

  it("renders star rating correctly", () => {
    render(<ProductCard product={mockProduct} />);

    const stars = screen.getAllByTestId("star");
    expect(stars.length).toBe(5);
  });
});