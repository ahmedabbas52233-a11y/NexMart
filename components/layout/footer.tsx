import Link from "next/link";
import { ShoppingCart, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Footer Component
 * 
 * Matches the Figma design:
 * - Newsletter signup section
 * - Multi-column link sections
 * - Social links
 * - Supplier CTA section
 * - Copyright bar
 */
export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-border">
      {/* Newsletter Section */}
      <div className="bg-primary-50 border-b border-border-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Get the latest deals and updates delivered to your inbox
              </p>
            </div>
            <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full md:w-72 bg-white"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">
                Shop<span className="text-primary">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your one-stop destination for the latest electronics, gadgets, and tech accessories at unbeatable prices.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">About</h4>
            <ul className="space-y-2.5">
              {["About Us", "Careers", "News & Blog", "Contact Us", "Terms & Conditions", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {["Help Center", "Returns & Refunds", "Shipping Info", "Track Order", "Size Guide", "FAQs"].map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-text-secondary hover:text-primary transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-text-secondary shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">
                  123 Commerce Street, Tech City, TC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-text-secondary shrink-0" />
                <span className="text-sm text-text-secondary">
                  +1 (555) 123-4567
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-text-secondary shrink-0" />
                <span className="text-sm text-text-secondary">
                  support@shopease.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Supplier CTA */}
      <div className="border-t border-border-light bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100 p-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                An easy way to send requests to all suppliers
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Connect with verified suppliers and get competitive quotes
              </p>
            </div>
            <Button variant="primary" size="lg">
              Send Request
            </Button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-text-secondary">
            <p>© 2026 ShopEase. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
