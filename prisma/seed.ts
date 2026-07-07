import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

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
        image: "https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?w=800&h=600&fit=crop&auto=compress&cs=tinysrgb",
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
        image: "https://images.pexels.com/photos/11671964/pexels-photo-11671964.jpeg?w=800&h=600&fit=crop&auto=compress&cs=tinysrgb",
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
        image: "https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?w=800&h=600&fit=crop&auto=compress&cs=tinysrgb",
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
        image: "https://images.pexels.com/photos/8373048/pexels-photo-8373048.jpeg?w=800&h=600&fit=crop&auto=compress&cs=tinysrgb",
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
        image: "https://images.pexels.com/photos/30968097/pexels-photo-30968097.jpeg?w=800&h=600&fit=crop&auto=compress&cs=tinysrgb",
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
      images: [
        "https://images.pexels.com/photos/3394665/pexels-photo-3394665.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/3394653/pexels-photo-3394653.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/5054541/pexels-photo-5054541.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/9130515/pexels-photo-9130515.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/5081419/pexels-photo-5081419.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/8373048/pexels-photo-8373048.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/8373049/pexels-photo-8373049.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/11671964/pexels-photo-11671964.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/12025472/pexels-photo-12025472.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/12039633/pexels-photo-12039633.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/14287/pexels-photo-14287.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/803226/pexels-photo-803226.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/13894718/pexels-photo-13894718.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/6045231/pexels-photo-6045231.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/6045230/pexels-photo-6045230.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/6045233/pexels-photo-6045233.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/19304049/pexels-photo-19304049.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/671629/pexels-photo-671629.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/7318664/pexels-photo-7318664.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/4793328/pexels-photo-4793328.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/5721063/pexels-photo-5721063.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/12960436/pexels-photo-12960436.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/30968097/pexels-photo-30968097.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/34939744/pexels-photo-34939744.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
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
      images: [
        "https://images.pexels.com/photos/20213726/pexels-photo-20213726.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb",
        "https://images.pexels.com/photos/27559516/pexels-photo-27559516.jpeg?w=800&h=800&fit=crop&auto=compress&cs=tinysrgb"
      ],
      rating: 4.4,
      reviewCount: 92,
      categoryId: categories[0].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
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