import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Resolves product images for seeding.
 *
 * WHY an API call instead of hardcoded photo IDs: guessing specific Unsplash
 * photo IDs for a product name is fragile — wrong guesses ship broken images
 * with no easy way to notice at build time. Searching Unsplash by keyword at
 * seed time guarantees the photo actually exists and is topically relevant.
 *
 * Falls back to `fallback` (a known-good curated URL) when no API key is
 * configured or the request fails, so `npm run db:seed` always works out of
 * the box — the Unsplash key is an enhancement, not a requirement.
 */
async function resolveImages(query: string, fallback: string, count = 2): Promise<string[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return [fallback];
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );

    if (!res.ok) return [fallback];

    const data = await res.json();
    const urls = (data.results ?? [])
      .map((photo: { urls: { regular: string } }) => photo.urls.regular)
      .slice(0, count);

    return urls.length > 0 ? urls : [fallback];
  } catch (error) {
    console.warn(`⚠️  Unsplash lookup failed for "${query}", using fallback image:`, error);
    return [fallback];
  }
}

async function main() {
  const adminPassword = await hash("admin123", 12);
  const userPassword = await hash("user123", 12);

  await prisma.user.upsert({
    where: { email: "admin@nexmart.com" },
    update: {},
    create: {
      email: "admin@nexmart.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "user@nexmart.com" },
    update: {},
    create: {
      email: "user@nexmart.com",
      name: "Demo User",
      password: userPassword,
      role: "USER",
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
        description: "Latest electronic gadgets and devices",
        image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=800&h=600&fit=crop&q=80&auto=format",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: {
        name: "Clothing",
        slug: "clothing",
        description: "Fashion and apparel",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=600&fit=crop&q=80&auto=format",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "home-outdoor" },
      update: {},
      create: {
        name: "Home & Outdoor",
        slug: "home-outdoor",
        description: "Home and outdoor essentials",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop&q=80&auto=format",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "sports" },
      update: {},
      create: {
        name: "Sports",
        slug: "sports",
        description: "Sports equipment and accessories",
        image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop&q=80&auto=format",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "beauty" },
      update: {},
      create: {
        name: "Beauty & Health",
        slug: "beauty",
        description: "Beauty products and health essentials",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&q=80&auto=format",
        sortOrder: 5,
      },
    }),
  ]);

  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
      price: 89.99,
      comparePrice: 129.99,
      stock: 45,
      sku: "WBH-001",
      brand: "AudioTech",
      imageFallback: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "wireless headphones",
      rating: 4.5,
      reviewCount: 128,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      name: "Smart Watch Pro",
      slug: "smart-watch-pro",
      description: "Advanced fitness tracking, heart rate monitoring, and smartphone integration.",
      price: 199.99,
      comparePrice: 249.99,
      stock: 30,
      sku: "SWP-002",
      brand: "TechGear",
      imageFallback: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "smartwatch",
      rating: 4.3,
      reviewCount: 89,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      name: "Running Shoes Elite",
      slug: "running-shoes-elite",
      description: "Lightweight running shoes with advanced cushioning technology.",
      price: 129.99,
      stock: 60,
      sku: "RSE-003",
      brand: "SportMax",
      imageFallback: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "running shoes",
      rating: 4.7,
      reviewCount: 256,
      isFeatured: true,
      categoryId: categories[3].id,
    },
    {
      name: "Cotton Casual T-Shirt",
      slug: "cotton-casual-t-shirt",
      description: "100% organic cotton t-shirt available in multiple colors.",
      price: 24.99,
      comparePrice: 34.99,
      stock: 150,
      sku: "CCT-004",
      brand: "ComfortWear",
      imageFallback: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "cotton t-shirt",
      rating: 4.2,
      reviewCount: 67,
      categoryId: categories[1].id,
    },
    {
      name: "Outdoor Camping Tent",
      slug: "outdoor-camping-tent",
      description: "4-person waterproof camping tent with easy setup.",
      price: 159.99,
      comparePrice: 199.99,
      stock: 20,
      sku: "OCT-005",
      brand: "WildGear",
      imageFallback: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "camping tent",
      rating: 4.6,
      reviewCount: 45,
      categoryId: categories[2].id,
    },
    {
      name: "Laptop Stand Adjustable",
      slug: "laptop-stand-adjustable",
      description: "Ergonomic aluminum laptop stand with adjustable height.",
      price: 49.99,
      stock: 80,
      sku: "LSA-006",
      brand: "DeskPro",
      imageFallback: "https://images.unsplash.com/photo-1611186871348-640e75d62e7d?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "laptop stand",
      rating: 4.4,
      reviewCount: 112,
      categoryId: categories[0].id,
    },
    {
      name: "Mechanical Gaming Keyboard",
      slug: "mechanical-gaming-keyboard",
      description: "RGB backlit mechanical keyboard with blue switches for tactile feedback.",
      price: 79.99,
      comparePrice: 99.99,
      stock: 35,
      sku: "MGK-007",
      brand: "GamePro",
      imageFallback: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "mechanical keyboard",
      rating: 4.8,
      reviewCount: 203,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description: "Extra thick non-slip yoga mat with carrying strap.",
      price: 34.99,
      comparePrice: 49.99,
      stock: 100,
      sku: "YMP-008",
      brand: "ZenFit",
      imageFallback: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "yoga mat",
      rating: 4.5,
      reviewCount: 89,
      categoryId: categories[3].id,
    },
    {
      name: "Denim Jacket Classic",
      slug: "denim-jacket-classic",
      description: "Classic blue denim jacket with vintage wash finish.",
      price: 59.99,
      stock: 40,
      sku: "DJC-009",
      brand: "UrbanStyle",
      imageFallback: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "denim jacket",
      rating: 4.3,
      reviewCount: 56,
      categoryId: categories[1].id,
    },
    {
      name: "Portable Blender",
      slug: "portable-blender",
      description: "USB rechargeable portable blender for smoothies on the go.",
      price: 29.99,
      comparePrice: 39.99,
      stock: 75,
      sku: "PBL-010",
      brand: "BlendGo",
      imageFallback: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "portable blender",
      rating: 4.1,
      reviewCount: 134,
      categoryId: categories[2].id,
    },
    {
      name: "Skincare Serum Set",
      slug: "skincare-serum-set",
      description: "Vitamin C and hyaluronic acid serum duo for glowing skin.",
      price: 44.99,
      comparePrice: 59.99,
      stock: 55,
      sku: "SSS-011",
      brand: "GlowLab",
      imageFallback: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "skincare serum",
      rating: 4.6,
      reviewCount: 178,
      isFeatured: true,
      categoryId: categories[4].id,
    },
    {
      name: "Wireless Mouse Ergonomic",
      slug: "wireless-mouse-ergonomic",
      description: "Ergonomic wireless mouse with adjustable DPI and silent clicks.",
      price: 39.99,
      stock: 90,
      sku: "WME-012",
      brand: "ErgoTech",
      imageFallback: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop&q=80&auto=format",
      imageQuery: "wireless mouse",
      rating: 4.4,
      reviewCount: 92,
      categoryId: categories[0].id,
    },
  ];

  for (const { imageFallback, imageQuery, ...product } of products) {
    const images = await resolveImages(imageQuery, imageFallback);
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, images },
    });
  }

  console.log("✅ Seed completed successfully");
  console.log(`- Admin: admin@nexmart.com / admin123`);
  console.log(`- User: user@nexmart.com / user123`);
  console.log(`- ${products.length} products created`);
  console.log(`- ${categories.length} categories created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });