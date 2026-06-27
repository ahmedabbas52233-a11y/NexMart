import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders copyright", () => {
    render(<Footer />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });
});