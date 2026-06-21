"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart,
  LogOut,
  LayoutDashboard,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

/**
 * Header Component
 * 
 * Matches the Figma design:
 * - Top bar with logo, search, cart, user actions
 * - Category navigation below
 * - Mobile responsive with hamburger menu
 * 
 * WHY useSession instead of server session:
 * Header is interactive (sign out, cart toggle) so it must be client-side.
 * useSession provides real-time auth state updates.
 */
export function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((state) => state.totalItems());
  const toggleCart = useCartStore((state) => state.toggleCart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  const categories = [
    "Electronics",
    "Mobile Phones",
    "Laptops",
    "Cameras",
    "Audio",
    "Wearables",
    "Home & Outdoor",
    "Furniture",
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface shadow-sm">
      {/* Main Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingCart className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary hidden sm:block">
              Shop<span className="text-primary">Ease</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form 
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                }
              }}
            >
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-12 rounded-lg border border-border bg-background text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md bg-primary text-white hover:bg-primary-600 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-text-secondary" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-text-secondary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {session?.user ? (
              <div className="relative group">
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-text-primary">
                    {session.user.name || session.user.email}
                  </span>
                  <ChevronDown className="hidden lg:block h-4 w-4 text-text-secondary" />
                </Button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface shadow-dropdown opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="py-1">
                    {isAdmin && (
                      <Link
                        href="/admin/products"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/auth/signin">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation - Desktop */}
      <nav className="hidden md:block border-t border-border-light bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-10 items-center gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
                className="shrink-0 px-3 py-1.5 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border-light bg-surface overflow-hidden transition-all duration-300",
          mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-3 space-y-3">
          {/* Mobile Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
              }
            }}
            className="relative"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-12 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md bg-primary text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Mobile Categories */}
          <div className="space-y-1">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, "-"))}`}
                className="block px-3 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
