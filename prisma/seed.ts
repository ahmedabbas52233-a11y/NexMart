import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 12);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@nexmart.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      { name: "Electronics", slug: "electronics", description: "Latest gadgets and devices", sortOrder: 1 },
      { name: "Audio", slug: "audio", description: "Headphones, speakers & more", sortOrder: 2 },
      { name: "Computers", slug: "computers", description: "Laptops, desktops & accessories", sortOrder: 3 },
      { name: "Smart Home", slug: "smart-home", description: "Smart devices for your home", sortOrder: 4 },
      { name: "Wearables", slug: "wearables", description: "Smartwatches and fitness trackers", sortOrder: 5 },
      { name: "Cameras", slug: "cameras", description: "Digital cameras and accessories", sortOrder: 6 },
      { name: "Gaming", slug: "gaming", description: "Consoles, games & accessories", sortOrder: 7 },
      { name: "Accessories", slug: "accessories", description: "Cables, chargers & more", sortOrder: 8 },
    ],
  });

  const cats = await prisma.category.findMany();

  const getCatId = (slug: string) => cats.find((c) => c.slug === slug)?.id || cats[0].id;

  // Create products
  const products = [
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise cancellation with two processors controlling eight microphones for unprecedented noise cancellation. Magnificent sound, engineered to perfection.",
      price: 349.99,
      comparePrice: 399.99,
      stock: 15,
      images: ["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80"],
      sku: "SONY-XM5-BLK",
      brand: "Sony",
      rating: 4.5,
      reviewCount: 128,
      isFeatured: true,
      categoryId: getCatId("audio"),
    },
    {
      name: "Apple MacBook Air M3",
      slug: "apple-macbook-air-m3",
      description: "Supercharged by the M3 chip, MacBook Air is up to 18 hours of battery life. The 15-inch Liquid Retina display supports 1 billion colors.",
      price: 1299.00,
      comparePrice: 1399.00,
      stock: 8,
      images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"],
      sku: "MBA-M3-15",
      brand: "Apple",
      rating: 4.8,
      reviewCount: 342,
      isFeatured: true,
      categoryId: getCatId("computers"),
    },
    {
      name: "Samsung Galaxy Watch 6",
      slug: "samsung-galaxy-watch-6",
      description: "Meet the watch that knows you best. Advanced sleep coaching, body composition analysis, and fitness tracking in a sleek design.",
      price: 299.99,
      comparePrice: 349.99,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"],
      sku: "SM-R930",
      brand: "Samsung",
      rating: 4.3,
      reviewCount: 89,
      isFeatured: true,
      categoryId: getCatId("wearables"),
    },
    {
      name: "Canon EOS R6 Mark II",
      slug: "canon-eos-r6-mark-ii",
      description: "Full-frame mirrorless camera with 24.2MP sensor, 40fps continuous shooting, and 4K 60p video recording.",
      price: 2499.00,
      comparePrice: 2799.00,
      stock: 5,
      images: ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80"],
      sku: "CANON-R6II",
      brand: "Canon",
      rating: 4.7,
      reviewCount: 56,
      isFeatured: true,
      categoryId: getCatId("cameras"),
    },
    {
      name: "PlayStation 5 Console",
      slug: "playstation-5",
      description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers, and 3D Audio.",
      price: 499.99,
      comparePrice: null,
      stock: 3,
      images: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80"],
      sku: "PS5-STD",
      brand: "Sony",
      rating: 4.9,
      reviewCount: 512,
      isFeatured: true,
      categoryId: getCatId("gaming"),
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Titanium design. A17 Pro chip. Action button. 48MP Main camera with 5x Telephoto zoom.",
      price: 1199.00,
      comparePrice: null,
      stock: 12,
      images: ["https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80"],
      sku: "IPHONE-15PM",
      brand: "Apple",
      rating: 4.6,
      reviewCount: 234,
      isFeatured: false,
      categoryId: getCatId("electronics"),
    },
    {
      name: "Bose QuietComfort Ultra Earbuds",
      slug: "bose-qc-ultra-earbuds",
      description: "World-class noise cancellation, CustomTune technology, and immersive audio. The most luxurious earbud experience from Bose.",
      price: 299.00,
      comparePrice: 349.00,
      stock: 18,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80"],
      sku: "BOSE-QC-ULT",
      brand: "Bose",
      rating: 4.4,
      reviewCount: 167,
      isFeatured: false,
      categoryId: getCatId("audio"),
    },
    {
      name: "Dell XPS 15 Laptop",
      slug: "dell-xps-15",
      description: "Stunning OLED display, 13th Gen Intel Core processors, and NVIDIA GeForce RTX graphics in a sleek, premium design.",
      price: 1799.00,
      comparePrice: 1999.00,
      stock: 7,
      images: ["https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800&q=80"],
      sku: "DELL-XPS15",
      brand: "Dell",
      rating: 4.2,
      reviewCount: 78,
      isFeatured: false,
      categoryId: getCatId("computers"),
    },
    {
      name: "Google Nest Hub Max",
      slug: "google-nest-hub-max",
      description: "10-inch smart display with Google Assistant. Make video calls, watch videos, and control your smart home.",
      price: 229.00,
      comparePrice: 299.00,
      stock: 14,
      images: ["https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800&q=80"],
      sku: "NEST-HUB-MAX",
      brand: "Google",
      rating: 4.1,
      reviewCount: 203,
      isFeatured: false,
      categoryId: getCatId("smart-home"),
    },
    {
      name: "Nintendo Switch OLED",
      slug: "nintendo-switch-oled",
      description: "7-inch OLED screen, enhanced audio, 64GB internal storage, and a wide adjustable stand for tabletop mode.",
      price: 349.99,
      comparePrice: null,
      stock: 9,
      images: ["https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80"],
      sku: "SWITCH-OLED",
      brand: "Nintendo",
      rating: 4.8,
      reviewCount: 445,
      isFeatured: false,
      categoryId: getCatId("gaming"),
    },
    {
      name: "Logitech MX Master 3S",
      slug: "logitech-mx-master-3s",
      description: "An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance.",
      price: 99.99,
      comparePrice: 129.99,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"],
      sku: "MX-MASTER-3S",
      brand: "Logitech",
      rating: 4.7,
      reviewCount: 312,
      isFeatured: false,
      categoryId: getCatId("accessories"),
    },
    {
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      description: "The most rugged and capable Apple Watch. Designed for outdoor adventure and endurance training.",
      price: 799.00,
      comparePrice: null,
      stock: 6,
      images: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80"],
      sku: "AW-ULTRA-2",
      brand: "Apple",
      rating: 4.6,
      reviewCount: 98,
      isFeatured: false,
      categoryId: getCatId("wearables"),
    },
    {
      name: "Sony A7 IV Mirrorless Camera",
      slug: "sony-a7-iv",
      description: "33MP full-frame sensor, 4K 60p video, real-time eye AF for humans, animals, and birds.",
      price: 2498.00,
      comparePrice: 2698.00,
      stock: 4,
      images: ["https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80"],
      sku: "SONY-A7IV",
      brand: "Sony",
      rating: 4.5,
      reviewCount: 67,
      isFeatured: false,
      categoryId: getCatId("cameras"),
    },
    {
      name: "Anker 737 Power Bank",
      slug: "anker-737-power-bank",
      description: "24,000mAh capacity, 140W output, smart digital display, and airline-approved for travel.",
      price: 149.99,
      comparePrice: 179.99,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80"],
      sku: "ANKER-737",
      brand: "Anker",
      rating: 4.3,
      reviewCount: 189,
      isFeatured: false,
      categoryId: getCatId("accessories"),
    },
    {
      name: "Philips Hue Starter Kit",
      slug: "philips-hue-starter",
      description: "White and color ambiance bulbs with Hue Bridge. Control with your voice or the Philips Hue app.",
      price: 199.99,
      comparePrice: 249.99,
      stock: 11,
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80"],
      sku: "HUE-STARTER",
      brand: "Philips",
      rating: 4.4,
      reviewCount: 156,
      isFeatured: false,
      categoryId: getCatId("smart-home"),
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ Seeded successfully!");
  console.log(`   • 1 admin user`);
  console.log(`   • ${cats.length} categories`);
  console.log(`   • ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });