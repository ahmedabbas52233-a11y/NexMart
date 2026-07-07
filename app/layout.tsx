import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getNavCategories } from "@/lib/categories";
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
    default: "NexMart - Your Trusted Electronics Store",
    template: "%s | NexMart",
  },
  description:
    "Discover the latest electronics, gadgets, and tech accessories at unbeatable prices. Free shipping on orders over $50.",
  keywords: ["electronics", "gadgets", "phones", "laptops", "cameras", "online store"],
  authors: [{ name: "NexMart" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexmart.vercel.app",
    siteName: "NexMart",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getNavCategories();

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header categories={categories} />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
