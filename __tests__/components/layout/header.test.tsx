import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/header";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

describe("Header", () => {
  it("renders logo", () => {
    render(<Header />);
    // NexMart text might be split, use getAllByText and check at least one exists
    const nexMartElements = screen.getAllByText((content) => content.includes("NexMart"));
    expect(nexMartElements.length).toBeGreaterThan(0);
  });
});