"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";

const footerLinks = {
  About: [
    { label: "About us", href: "/about" },
    { label: "All Categories", href: "/products" },
  ],
  "Customer service": [
    { label: "FAQ", href: "/faq" },
    { label: "Contact us", href: "/contact" },
  ],
  Information: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  "For users": [
    { label: "Login", href: "/auth/signin" },
    { label: "Register", href: "/auth/signup" },
    { label: "My Account", href: "/profile" },
    { label: "My Orders", href: "/profile" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-primary-gradient">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">NexMart</span>
            </Link>
            <p className="text-sm text-[#8B96A5] mb-4 leading-relaxed">
              Best information about the company goes here but now lorem ipsum
              is
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Twitter, label: "Twitter" },
                { icon: Instagram, label: "Instagram" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  aria-label={`${label} (not linked in this demo)`}
                  title={`${label} (not linked in this demo)`}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 opacity-60 cursor-not-allowed"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8B96A5] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* App download */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-sm mb-3">Get the App</h4>
            <div className="space-y-2">
              <div
                aria-label="Mobile app not available in this demo"
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 cursor-not-allowed opacity-60"
              >
                <div className="text-xs">
                  <div className="text-[10px] text-[#8B96A5]">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </div>
              <div
                aria-label="Mobile app not available in this demo"
                className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 cursor-not-allowed opacity-60"
              >
                <div className="text-xs">
                  <div className="text-[10px] text-[#8B96A5]">Download on</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8B96A5]">
          <p>© 2026 NexMart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Cookies
            </Link>
            <div className="flex items-center gap-1 border border-white/20 rounded px-2 py-1">
              <span>🇺🇸</span>
              <span>English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
