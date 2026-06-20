# ShopEase - Full-Stack eCommerce Application

> **Production-grade eCommerce platform built with Next.js 14, TypeScript, Prisma, and PostgreSQL.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)](https://tailwindcss.com/)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Header    │  │    Pages    │  │   Cart Drawer    │   │
│  │  (Client)   │  │  (Server)   │  │    (Client)      │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Zustand    │  │  NextAuth   │  │  React Hook Form │   │
│  │   Store     │  │   Session   │  │   + Zod Valid.   │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   /products │  │    /cart    │  │  /auth/[...next] │   │
│  │   (CRUD)    │  │  (Server)   │  │   (NextAuth)     │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │/admin/prod. │  │ /auth/reg.  │                           │
│  │ (Protected) │  │ (Register)  │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                    PostgreSQL + Prisma                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  User    │  │ Product  │  │ Category │  │ CartItem │    │
│  │(NextAuth)│  │          │  │          │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack Decisions

| Technology | Purpose | Why |
|-----------|---------|-----|
| **Next.js 14** | Framework | App Router, Server Components, API Routes in one project |
| **TypeScript** | Type Safety | Strict mode, path aliases, no runtime errors from types |
| **Prisma** | ORM | Type-safe queries, migrations, excellent DX |
| **PostgreSQL** | Database | Production reliability, JSON support, full-text search ready |
| **NextAuth** | Authentication | JWT sessions, OAuth providers, CSRF protection out of box |
| **Zustand** | State Management | No providers, minimal boilerplate, localStorage persistence |
| **Tailwind CSS** | Styling | Utility-first, design system tokens, minimal CSS files |
| **Radix UI** | Primitives | Accessible, unstyled components (Dialog, Dropdown, etc.) |
| **Zod** | Validation | Schema validation for forms and API inputs |
| **bcryptjs** | Password Hashing | 12 rounds, secure but not too slow (~250ms) |

---

## 📁 Project Structure

```
ecommerce-fullstack-design/
├── app/                          # Next.js App Router
│   ├── (shop)/                   # Public routes group
│   │   ├── page.tsx              # Home (Server Component)
│   │   ├── products/
│   │   │   ├── page.tsx          # Product listing (Server)
│   │   │   ├── loading.tsx       # Skeleton loading state
│   │   │   └── error.tsx         # Error boundary
│   │   ├── product/[id]/
│   │   │   ├── page.tsx          # Product detail (Server)
│   │   │   └── not-found.tsx     # 404 for invalid slugs
│   │   └── cart/
│   │       └── page.tsx          # Cart (Client Component)
│   ├── admin/
│   │   └── products/
│   │       └── page.tsx          # Admin CRUD (Protected)
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handlers
│   │   │   └── register/         # Registration endpoint
│   │   ├── products/             # Product CRUD API
│   │   ├── cart/                 # Cart operations API
│   │   └── admin/                # Admin-only APIs
│   ├── layout.tsx                # Root layout (SEO, fonts)
│   └── globals.css               # Tailwind + custom styles
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx            # CVA variants
│   │   ├── input.tsx             # Form input with label/error
│   │   ├── badge.tsx             # Status badges
│   │   └── skeleton.tsx          # Loading skeletons
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # Sticky header with search
│   │   ├── footer.tsx            # Full footer
│   │   ├── providers.tsx         # Context providers
│   │   └── cart-drawer.tsx       # Slide-over cart
│   └── product/                  # Product components
│       ├── product-card.tsx      # Figma-matched card
│       └── add-to-cart-button.tsx # Quantity + add to cart
├── lib/                          # Utilities
│   ├── utils.ts                  # cn(), formatPrice(), etc.
│   ├── db.ts                     # Prisma singleton
│   └── auth.ts                   # NextAuth configuration
├── hooks/                        # Custom React hooks
│   ├── useCart.ts                # Zustand cart store
│   └── useCartAPI.ts             # Cart API operations
├── types/                        # TypeScript types
│   ├── index.ts                  # Shared interfaces
│   └── next-auth.d.ts            # NextAuth type augmentation
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Sample data (15 products)
├── public/                       # Static assets
├── middleware.ts                 # Route protection (ADMIN)
├── tailwind.config.ts            # Design system tokens
├── next.config.mjs               # Production config
└── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud: Neon, Supabase, Railway)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd ecommerce-fullstack-design
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-long"

# OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Admin credentials (for seeding)
ADMIN_EMAIL="admin@ecommerce.com"
ADMIN_PASSWORD="Admin123!"
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@ecommerce.com` | `Admin123!` |
| User | Register via `/auth/signup` | Your choice |

---

## 🎯 Features Implemented

### Week 1: Frontend (Complete ✅)
- [x] Responsive design (mobile-first, breakpoints: sm, md, lg, xl)
- [x] Home page with Hero, Categories, Deals, Featured, Recommended
- [x] Product listing with filters, sorting, pagination
- [x] Product detail with image gallery, specs, related products
- [x] Cart page with quantity controls, order summary
- [x] Search functionality (header + dedicated page)
- [x] Design matches Figma template (colors, spacing, typography)

### Week 2: Backend Integration (Complete ✅)
- [x] PostgreSQL database with Prisma ORM
- [x] RESTful API for products (CRUD)
- [x] Server-side cart persistence (database-backed)
- [x] Dynamic data fetching on all pages
- [x] Search and filter API with pagination
- [x] Image optimization (Next.js Image component)

### Week 3: Advanced Features (Complete ✅)
- [x] JWT-based authentication (NextAuth)
- [x] Role-based access control (USER vs ADMIN)
- [x] Admin panel with product CRUD
- [x] Cart management (add/remove/update quantities)
- [x] Protected routes via middleware
- [x] Form validation with Zod
- [x] Toast notifications (Sonner)
- [x] Loading states and error boundaries
- [x] SEO optimization (metadata, OG tags)

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **Password Hashing** | bcryptjs with 12 salt rounds |
| **Session Management** | JWT tokens, server-side validation |
| **CSRF Protection** | Built into NextAuth |
| **XSS Prevention** | React escapes HTML by default |
| **SQL Injection** | Prisma parameterized queries |
| **Route Protection** | Middleware + server-side checks |
| **Security Headers** | X-Frame-Options, X-Content-Type-Options |
| **Input Validation** | Zod schemas on all API endpoints |

---

## 📊 Database Schema

```prisma
User          → id, email, name, password, role, accounts[], sessions[], cartItems[]
Account       → id, userId, provider, providerAccountId (NextAuth OAuth)
Session       → id, sessionToken, userId, expires (NextAuth sessions)
Product       → id, name, slug, description, price, comparePrice, stock, images[], sku, categoryId, brand, rating, reviewCount, isActive, isFeatured
Category      → id, name, slug, description, image, parentId, children[], products[]
CartItem      → id, userId, productId, quantity (unique: userId + productId)
```

---

## 🧪 Testing (Recommended Additions)

```bash
# Unit tests
npm install -D vitest @testing-library/react @testing-library/jest-dom

# E2E tests
npm install -D playwright

# Run tests
npm test
npx playwright test
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-postgres-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### Build Command
```bash
npm run build
```

---

## 📝 API Documentation

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | List products (filter, sort, paginate) |
| POST | `/api/products` | Admin | Create product |
| GET | `/api/products/[id]` | No | Get single product |
| PATCH | `/api/products/[id]` | Admin | Update product |
| DELETE | `/api/products/[id]` | Admin | Soft delete product |

### Cart
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | Yes | Get user's cart |
| POST | `/api/cart` | Yes | Add item to cart |
| PATCH | `/api/cart` | Yes | Update quantity |
| DELETE | `/api/cart?productId=` | Yes | Remove item |

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| GET/POST | `/api/auth/[...nextauth]` | No | NextAuth handlers |

---

## 🎨 Design System

### Colors
- **Primary**: `#0066FF` (Figma blue)
- **Success**: `#00B517`
- **Warning**: `#FF9017`
- **Danger**: `#FA3434`
- **Background**: `#F7FAFC`
- **Surface**: `#FFFFFF`
- **Text Primary**: `#1C1C1C`
- **Text Secondary**: `#8B96A5`

### Typography
- **Font**: Inter (Google Fonts)
- **Display**: 2.5rem / 600 weight
- **Heading 1**: 2rem / 600 weight
- **Body**: 0.875rem / 400 weight
- **Caption**: 0.75rem / 400 weight

### Spacing Scale
- Based on Tailwind defaults + custom: 18 (4.5rem), 88 (22rem), 128 (32rem)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

## 🙏 Acknowledgments

- [Figma Community](https://www.figma.com/community) for the design template
- [Next.js Team](https://nextjs.org) for the incredible framework
- [Vercel](https://vercel.com) for hosting and deployment

---

> **Built with ❤️ for the Full-Stack Development Internship**
> 
> *Deadline: June 26, 2026*
