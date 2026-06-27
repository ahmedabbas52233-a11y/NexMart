"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  MapPin,
  Globe,
} from "lucide-react";
import { useCartStore } from "@/hooks/useCart";

/**
 * Header — matches Figma design exactly
 * - Light blue (#E5F1FF) header background
 * - Logo + search with category dropdown + user actions
 * - Category navigation bar below
 */
export function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All category");
  const router = useRouter();

  const isAdmin = session?.user?.role === "ADMIN";

  const navCategories = [
    { label: "Electronics", slug: "electronics" },
    { label: "Mobile Phones", slug: "mobile-phones" },
    { label: "Laptops", slug: "laptops" },
    { label: "Cameras", slug: "cameras" },
    { label: "Audio", slug: "audio" },
    { label: "Wearables", slug: "wearables" },
  ];

  const searchCategories = [
    "All category", "Electronics", "Mobile Phones",
    "Laptops", "Cameras", "Audio", "Wearables",
    "Home & Outdoor", "Furniture",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cat = selectedCategory !== "All category"
      ? `&category=${encodeURIComponent(selectedCategory.toLowerCase().replace(/ /g, "-"))}`
      : "";
    router.push(`/products?search=${encodeURIComponent(searchQuery)}${cat}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">

      {/* ── Top announcement bar ─────────────────────────────────────────── */}
      <div className="bg-[#1C1C1C] text-white text-xs py-1.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Deliver to <strong className="ml-1">United States</strong>
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Save big with our app!</span>
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            English, USD
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </span>
          {session ? (
            <button onClick={() => signOut()} className="hover:text-primary-50">
              Sign out
            </button>
          ) : (
            <>
              <Link href="/auth/signup" className="hover:underline">Sign up</Link>
              <Link href="/auth/signin" className="hover:underline">Sign in</Link>
            </>
          )}
        </div>
      </div>

      {/* ── Main header ──────────────────────────────────────────────────── */}
      <div className="bg-[#E5F1FF] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center"
              className="bg-primary-gradient">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1C1C1C] hidden sm:block">
              Nex<span className="text-primary">Mart</span>
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 flex max-w-2xl">
            {/* Category dropdown */}
            <div className="relative hidden md:block">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Search category"
                className="h-10 pl-3 pr-8 border border-[#DEE2E7] border-r-0 rounded-l-md bg-white text-sm text-[#1C1C1C] focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                {searchCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B96A5] pointer-events-none" />
            </div>
            {/* Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-10 px-4 border border-[#DEE2E7] bg-white text-sm focus:outline-none focus:border-primary md:rounded-none"
            />
            {/* Button */}
            <button
              type="submit"
              aria-label="Search"
              className="h-10 px-5 rounded-r-md text-white text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              className="bg-primary-gradient"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors text-[#1C1C1C]"
            >
              <Heart className="h-5 w-5" />
              <span className="text-[10px] hidden sm:block">Wishlist</span>
            </button>

            {/* Account */}
            {session ? (
              <Link
                href={isAdmin ? "/admin" : "/profile"}
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors text-[#1C1C1C]"
              >
                {isAdmin ? <LayoutDashboard className="h-5 w-5" /> : <User className="h-5 w-5" />}
                <span className="text-[10px] hidden sm:block max-w-[60px] truncate">
                  {session.user?.name?.split(" ")[0] ?? "Account"}
                </span>
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors text-[#1C1C1C]"
              >
                <User className="h-5 w-5" />
                <span className="text-[10px] hidden sm:block">Account</span>
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={toggleCart}
              aria-label="Open cart"
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-white/50 transition-colors text-[#1C1C1C] relative"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full text-[10px] font-bold text-white"
                    className="bg-primary-gradient">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[10px] hidden sm:block">My cart</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category navigation bar ───────────────────────────────────────── */}
      <div className="bg-white border-b border-[#DEE2E7] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          {/* All category dropdown */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors shrink-0">
            <Menu className="h-4 w-4" />
            All category
            <ChevronDown className="h-3.5 w-3.5 ml-auto" />
          </div>
          {/* Category links */}
          <nav className="flex items-center overflow-x-auto">
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="px-4 py-2.5 text-sm text-[#1C1C1C] hover:text-primary whitespace-nowrap transition-colors border-b-2 border-transparent hover:border-primary"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/products"
              className="px-4 py-2.5 text-sm text-[#8B96A5] hover:text-primary whitespace-nowrap transition-colors"
            >
              More ›
            </Link>
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#DEE2E7] px-4 py-3">
          <form onSubmit={handleSearch} className="flex mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 h-10 px-4 border border-[#DEE2E7] rounded-l-md bg-white text-sm focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="h-10 px-4 rounded-r-md text-white"
              className="bg-primary-gradient"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          <div className="grid grid-cols-2 gap-1">
            {navCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-[#1C1C1C] hover:text-primary hover:bg-[#E5F1FF] rounded-md transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
