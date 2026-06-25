"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingCart, MessageSquare, Package, User, Menu, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-white border-b border-[#E0E0E0]">
      {/* Top Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[86px] gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-[#0D6EFD] rounded opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                N
              </div>
            </div>
            <span className="text-[#8CB7F5] font-bold text-xl hidden sm:block">Brand</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[600px] hidden md:flex">
            <div className="flex w-full border border-[#0D6EFD] rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm outline-none"
              />
              <select className="border-l border-[#0D6EFD] px-3 text-sm bg-white outline-none text-[#1C1C1C]">
                <option>All category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Home</option>
              </select>
              <button
                type="submit"
                className="bg-gradient-to-b from-[#127FFF] to-[#0067FF] text-white px-6 font-medium"
              >
                Search
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <HeaderIcon icon={<User className="w-5 h-5" />} label="Profile" href="/auth/signin" />
            <HeaderIcon icon={<MessageSquare className="w-5 h-5" />} label="Message" href="#" />
            <HeaderIcon icon={<Package className="w-5 h-5" />} label="Orders" href="#" />
            <Link href="/cart" className="flex flex-col items-center gap-0.5 relative">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#8B96A5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FA3434] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#8B96A5]">My cart</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="border-t border-[#E0E0E0] hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14 gap-8">
            <button className="flex items-center gap-2 font-medium text-[#1C1C1C]">
              <Menu className="w-5 h-5" />
              All category
            </button>
            {["Hot offers", "Gift boxes", "Projects", "Menu item", "Help"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-[#1C1C1C] font-medium text-sm hover:text-[#0D6EFD] transition-colors"
              >
                {item}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-6 text-sm text-[#1C1C1C]">
              <span className="font-medium">English, USD</span>
              <span className="flex items-center gap-1">
                Ship to <span className="w-5 h-3 bg-[#1C1C1C] rounded-sm inline-block" /> 
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E0E0E0] p-4">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex border border-[#0D6EFD] rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search"
                className="flex-1 px-4 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-[#0D6EFD] text-white px-4">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
          <nav className="space-y-2">
            {["All category", "Hot offers", "Gift boxes", "Projects", "Help"].map((item) => (
              <Link
                key={item}
                href="#"
                className="block py-2 text-[#1C1C1C] font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function HeaderIcon({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5">
      {icon}
      <span className="text-xs text-[#8B96A5]">{label}</span>
    </Link>
  );
}