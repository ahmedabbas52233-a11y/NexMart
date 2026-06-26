import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ShopEase - Your Trusted Electronics Store",
    template: "%s | ShopEase",
  },
  description:
    "Discover the latest electronics, gadgets, and tech accessories at unbeatable prices. Free shipping on orders over $50.",
  keywords: ["electronics", "gadgets", "phones", "laptops", "cameras", "online store"],
  authors: [{ name: "ShopEase" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shopease.vercel.app",
    siteName: "ShopEase",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
