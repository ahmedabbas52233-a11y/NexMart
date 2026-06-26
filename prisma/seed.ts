import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (for clean seeding)
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 12);
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@ecommerce.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create categories matching the Figma design
  const categories = await prisma.category.createMany({
    data: [
      {
        id: "cat_electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Latest gadgets and electronic devices",
        image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=200",
        sortOrder: 1,
      },
      {
        id: "cat_phones",
        name: "Mobile Phones",
        slug: "mobile-phones",
        description: "Smartphones and accessories",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
        sortOrder: 2,
      },
      {
        id: "cat_laptops",
        name: "Laptops",
        slug: "laptops",
        description: "Notebooks and ultrabooks",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200",
        sortOrder: 3,
      },
      {
        id: "cat_cameras",
        name: "Cameras",
        slug: "cameras",
        description: "Digital cameras and lenses",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200",
        sortOrder: 4,
      },
      {
        id: "cat_audio",
        name: "Audio",
        slug: "audio",
        description: "Headphones, speakers and audio gear",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
        sortOrder: 5,
      },
      {
        id: "cat_wearables",
        name: "Wearables",
        slug: "wearables",
        description: "Smart watches and fitness trackers",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
        sortOrder: 6,
      },
      {
        id: "cat_home",
        name: "Home & Outdoor",
        slug: "home-outdoor",
        description: "Smart home and outdoor equipment",
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=200",
        sortOrder: 7,
      },
      {
        id: "cat_furniture",
        name: "Furniture",
        slug: "furniture",
        description: "Office and home furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200",
        sortOrder: 8,
      },
    ],
  });
  console.log("✅ Categories created:", categories.count);

  // Create products with realistic data
  const products = [
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise cancellation with two processors controlling eight microphones. Auto NC Optimizer for personalized noise canceling.",
      price: 348.00,
      comparePrice: 399.99,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
      ],
      sku: "SNY-WH1000XM5-BLK",
      categoryId: "cat_audio",
      brand: "Sony",
      rating: 4.8,
      reviewCount: 2341,
      isFeatured: true,
    },
    {
      name: "Canon EOS R6 Mark II",
      slug: "canon-eos-r6-mark-ii",
      description: "Full-frame mirrorless camera with 24.2MP sensor, 40fps continuous shooting, and 4K 60p video recording.",
      price: 2499.00,
      comparePrice: 2799.00,
      stock: 12,
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      ],
      sku: "CN-EOSR6M2-BDY",
      categoryId: "cat_cameras",
      brand: "Canon",
      rating: 4.9,
      reviewCount: 567,
      isFeatured: true,
    },
    {
      name: "MacBook Pro 14-inch M3",
      slug: "macbook-pro-14-m3",
      description: "Supercharged by M3 chip. Up to 22 hours battery life. Stunning 14.2-inch Liquid Retina XDR display.",
      price: 1599.00,
      comparePrice: 1699.00,
      stock: 28,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      ],
      sku: "APP-MBP14-M3-SLV",
      categoryId: "cat_laptops",
      brand: "Apple",
      rating: 4.7,
      reviewCount: 1892,
      isFeatured: true,
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Titanium design. A17 Pro chip. Action button. 48MP main camera with 5x Telephoto.",
      price: 1199.00,
      comparePrice: 1299.00,
      stock: 67,
      images: [
        "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800",
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
      ],
      sku: "APP-IP15PM-256-BLU",
      categoryId: "cat_phones",
      brand: "Apple",
      rating: 4.6,
      reviewCount: 3421,
      isFeatured: true,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Galaxy AI is here. 200MP camera. Built-in S Pen. Titanium frame. 6.8-inch QHD+ display.",
      price: 1299.99,
      comparePrice: 1399.99,
      stock: 34,
      images: [
        "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=800",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
      ],
      sku: "SAM-GS24U-512-GRY",
      categoryId: "cat_phones",
      brand: "Samsung",
      rating: 4.5,
      reviewCount: 1876,
      isFeatured: true,
    },
    {
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      description: "The most rugged and capable Apple Watch. 49mm titanium case. Precision GPS. Water resistant 100m.",
      price: 799.00,
      comparePrice: 849.00,
      stock: 23,
      images: [
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      ],
      sku: "APP-AWU2-49-ORG",
      categoryId: "cat_wearables",
      brand: "Apple",
      rating: 4.8,
      reviewCount: 923,
      isFeatured: true,
    },
    {
      name: "Bose QuietComfort Ultra",
      slug: "bose-quietcomfort-ultra",
      description: "World-class noise cancellation, CustomTune technology, and immersive spatial audio.",
      price: 429.00,
      comparePrice: 479.00,
      stock: 56,
      images: [
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      ],
      sku: "BOSE-QC-ULT-BLK",
      categoryId: "cat_audio",
      brand: "Bose",
      rating: 4.6,
      reviewCount: 1456,
      isFeatured: false,
    },
    {
      name: "Dell XPS 15",
      slug: "dell-xps-15",
      description: "15.6-inch InfinityEdge display. 13th Gen Intel Core processors. NVIDIA GeForce RTX 4050.",
      price: 1849.99,
      comparePrice: 1999.99,
      stock: 15,
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800",
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      ],
      sku: "DELL-XPS15-9530",
      categoryId: "cat_laptops",
      brand: "Dell",
      rating: 4.4,
      reviewCount: 678,
      isFeatured: false,
    },
    {
      name: "Nikon Z8",
      slug: "nikon-z8",
      description: "45.7MP stacked CMOS sensor. 8K RAW video. 120fps stills. Professional mirrorless performance.",
      price: 3496.95,
      comparePrice: 3699.95,
      stock: 8,
      images: [
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      ],
      sku: "NK-Z8-BODY",
      categoryId: "cat_cameras",
      brand: "Nikon",
      rating: 4.9,
      reviewCount: 234,
      isFeatured: false,
    },
    {
      name: "Samsung Galaxy Watch 6 Classic",
      slug: "samsung-galaxy-watch-6-classic",
      description: "Rotating bezel. Body composition analysis. Sleep coaching. 47mm stainless steel case.",
      price: 399.99,
      comparePrice: 449.99,
      stock: 42,
      images: [
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
        "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800",
      ],
      sku: "SAM-GW6C-47-BLK",
      categoryId: "cat_wearables",
      brand: "Samsung",
      rating: 4.3,
      reviewCount: 1123,
      isFeatured: false,
    },
    {
      name: "Google Pixel 8 Pro",
      slug: "google-pixel-8-pro",
      description: "The first phone with AI built in. Magic Editor. Best Take. Video Boost. 7 years of updates.",
      price: 999.00,
      comparePrice: 1099.00,
      stock: 31,
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
        "https://images.unsplash.com/photo-1610945265078-3858a0828671?w=800",
      ],
      sku: "GOO-P8P-128-OBS",
      categoryId: "cat_phones",
      brand: "Google",
      rating: 4.5,
      reviewCount: 876,
      isFeatured: false,
    },
    {
      name: "Logitech MX Master 3S",
      slug: "logitech-mx-master-3s",
      description: "Ultra-fast scrolling. 8K DPI sensor. Quiet clicks. USB-C charging. Multi-device control.",
      price: 99.99,
      comparePrice: 129.99,
      stock: 89,
      images: [
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
      ],
      sku: "LOG-MXM3S-GRY",
      categoryId: "cat_electronics",
      brand: "Logitech",
      rating: 4.8,
      reviewCount: 5678,
      isFeatured: false,
    },
    {
      name: "Herman Miller Aeron Chair",
      slug: "herman-miller-aeron",
      description: "Iconic ergonomic office chair. Pellicle suspension. PostureFit SL support. 12-year warranty.",
      price: 1695.00,
      comparePrice: 1895.00,
      stock: 18,
      images: [
        "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800",
        "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800",
      ],
      sku: "HM-AERON-B-SIZE",
      categoryId: "cat_furniture",
      brand: "Herman Miller",
      rating: 4.7,
      reviewCount: 2341,
      isFeatured: true,
    },
    {
      name: "Philips Hue Starter Kit",
      slug: "philips-hue-starter-kit",
      description: "Smart lighting with 16 million colors. Bridge included. Works with Alexa, Google, HomeKit.",
      price: 199.99,
      comparePrice: 249.99,
      stock: 67,
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
        "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800",
      ],
      sku: "PHI-HUE-START-4",
      categoryId: "cat_home",
      brand: "Philips",
      rating: 4.6,
      reviewCount: 3421,
      isFeatured: false,
    },
    {
      name: "DJI Mini 4 Pro",
      slug: "dji-mini-4-pro",
      description: "Under 249g. 4K/60fps HDR video. 34-min flight time. Omnidirectional obstacle sensing.",
      price: 759.00,
      comparePrice: 859.00,
      stock: 22,
      images: [
        "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800",
        "https://images.unsplash.com/photo-1506947411487-a56738267384?w=800",
      ],
      sku: "DJI-MINI4-PRO",
      categoryId: "cat_electronics",
      brand: "DJI",
      rating: 4.8,
      reviewCount: 1567,
      isFeatured: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log("✅ Products created:", products.length);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log("   - Admin User: 1");
  console.log("   - Categories: 8");
  console.log("   - Products: 15");
  console.log("\n🔑 Admin Login:");
  console.log("   Email:", process.env.ADMIN_EMAIL || "admin@ecommerce.com");
  console.log("   Password:", process.env.ADMIN_PASSWORD || "Admin123!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
