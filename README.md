<div align="center">

# NexMart

### Production-grade full-stack eCommerce platform

[![CI](https://github.com/ahmedabbas52233-a11y/ecommerce-fullstack-design/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedabbas52233-a11y/ecommerce-fullstack-design/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-55%2B%20passing-brightgreen?logo=vitest)](./\_\_tests\_\_)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[**Live Demo**](#deployment) · [**Report Bug**](https://github.com/ahmedabbas52233-a11y/ecommerce-fullstack-design/issues) · [**Request Feature**](https://github.com/ahmedabbas52233-a11y/ecommerce-fullstack-design/issues)

> 🚀 **Deploy to Vercel first, then replace this link with your live URL.**

</div>

---

## Screenshots

> _Deploy to Vercel first, then replace these with your own screenshots._

| Home | Products | Cart | Admin |
|------|----------|------|-------|
| ![Home](docs/screenshots/home.png) | ![Products](docs/screenshots/products.png) | ![Cart](docs/screenshots/cart.png) | ![Admin](docs/screenshots/admin.png) |

---

## Architecture

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
│  │  /products  │  │    /cart    │  │  /auth/[...next] │   │
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
│                    PostgreSQL + Prisma                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  User    │  │ Product  │  │ Category │  │ CartItem │   │
│  │(NextAuth)│  │          │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Technology | Purpose | Why chosen |
|-----------|---------|------------|
| **Next.js 14** | Framework | App Router unifies frontend, API routes, and SSR in one project |
| **TypeScript** | Type safety | Strict mode — catches bugs at compile time, not in production |
| **Prisma** | ORM | Type-safe queries, auto-migrations, excellent DX over raw SQL |
| **PostgreSQL** | Database | ACID compliance, JSON support, production reliability |
| **NextAuth** | Authentication | CSRF protection, OAuth support, and session management out of the box |
| **Zustand** | State management | No provider boilerplate; localStorage persistence middleware built in |
| **Tailwind CSS** | Styling | Design system tokens, utility-first, zero runtime CSS-in-JS overhead |
| **Radix UI** | Primitives | Accessible, unstyled — full styling control without re-implementing ARIA |
| **Zod** | Validation | Runtime schema validation on all API inputs; inferred TypeScript types |
| **bcryptjs** | Password hashing | 12 salt rounds (~250ms) — slow enough to resist brute force |
| **Vitest** | Testing | Vite-native, fast HMR test runner with native ESM and TypeScript support |
| **Framer Motion** | Animations | Declarative, performant animations without manual CSS keyframes |

---

## Features

**Storefront**
- Responsive design (mobile-first; breakpoints: sm / md / lg / xl)
- Home page with hero banner, category grid, deals section, featured and recommended products
- Product listing with search, filter by category and price range, sort by price / rating / newest
- Product detail page with image gallery, add-to-cart with quantity selector, related products
- Slide-over cart drawer with live item count badge
- Full cart page with quantity controls and order summary

**Authentication**
- Email/password registration with Zod validation
- JWT sessions via NextAuth (30-day expiry)
- Role-based access control: `USER` vs `ADMIN`
- Edge middleware route protection — server-side, not client-side guards
- Google OAuth integration (configure `GOOGLE_CLIENT_ID` to enable)

**Admin Panel** (`/admin` — ADMIN role required)
- Product CRUD: create, edit, soft-delete
- Protected via Next.js middleware at the edge
- Manages categories, stock, featured flags, and discount prices

**Cart**
- Server-side persistence (PostgreSQL) — survives page refresh and device switches
- Optimistic UI updates with automatic rollback on API error
- Upsert logic: adding the same product increments quantity

---

## Project Structure

```
ecommerce-fullstack-design/
├── app/                          # Next.js App Router
│   ├── (shop)/                   # Public route group
│   │   ├── page.tsx              # Home (Server Component)
│   │   ├── products/page.tsx     # Listing with filters (Server)
│   │   ├── product/[id]/page.tsx # Detail (Server)
│   │   └── cart/page.tsx         # Cart (Client)
│   ├── admin/products/page.tsx   # Admin CRUD (protected)
│   ├── api/
│   │   ├── auth/register/        # Registration endpoint
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── products/             # Product CRUD API
│   │   └── cart/                 # Cart operations API
│   └── auth/                     # Sign-in / sign-up pages
├── components/
│   ├── ui/                       # Button, Input, Badge, Skeleton
│   ├── layout/                   # Header, Footer, CartDrawer, Providers
│   └── product/                  # ProductCard, AddToCartButton
├── hooks/
│   ├── useCart.ts                # Zustand store (state + computed)
│   └── useCartAPI.ts             # API calls with optimistic updates
├── lib/
│   ├── utils.ts                  # cn(), formatPrice(), slugify(), truncate()
│   ├── db.ts                     # Prisma singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── env.ts                    # Zod env validation — fails fast on missing vars
│   └── rate-limit.ts             # In-memory token bucket rate limiter
├── __tests__/                    # Vitest test suite
│   ├── lib/utils.test.ts         # Utility function unit tests
│   ├── hooks/useCart.test.ts     # Zustand store tests
│   ├── api/products.test.ts      # Products API route tests
│   ├── api/product-detail.test.ts
│   ├── api/register.test.ts      # Auth registration tests
│   ├── api/cart.test.ts          # Cart API route tests
│   └── components/product-card.test.tsx
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Sample data (15 products, 8 categories)
├── types/                        # Shared TypeScript interfaces
├── middleware.ts                 # Edge route protection
├── vitest.config.ts              # Test configuration
├── vitest.setup.ts               # Global test setup
└── .github/workflows/ci.yml     # CI: lint → test → build
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database — [Neon](https://neon.tech) free tier works out of the box

### 1. Clone & Install

```bash
git clone https://github.com/ahmedabbas52233-a11y/ecommerce-fullstack-design.git
cd ecommerce-fullstack-design
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# PostgreSQL — get a free DB at neon.tech
DATABASE_URL="postgresql://user:password@host/ecommerce?schema=public&sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-char-secret-here"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Seed credentials
ADMIN_EMAIL="admin@nexmart.com"
ADMIN_PASSWORD="Admin123!"
```

### 3. Database Setup

```bash
npx prisma generate      # generate the Prisma client
npx prisma db push       # push schema to your database
npm run db:seed          # seed 15 products + admin user
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

**Default credentials:**

| Role  | Email                 | Password   |
|-------|-----------------------|------------|
| Admin | `admin@nexmart.com`   | `Admin123!` |
| User  | Register at `/auth/signup` | —     |

---

## Testing

The test suite covers utility functions, Zustand store logic, all API route handlers, and the ProductCard component using Vitest + React Testing Library.

```bash
# Run all tests (watch mode)
npm test

# Single run
npm run test:run

# With coverage report
npm run test:coverage
```

**Coverage targets:** 70% lines / functions / statements, 60% branches.

Test files live in `__tests__/` mirroring the source structure:

```
__tests__/
├── lib/utils.test.ts            # cn, formatPrice, calculateDiscount, slugify, truncate
├── lib/rate-limit.test.ts       # token bucket logic, window reset, per-IP isolation, all 3 limiters
├── hooks/useCart.test.ts        # addItem, removeItem, updateQuantity, totalItems, totalPrice
├── api/products.test.ts         # GET (filters, search, sort, pagination), POST
├── api/product-detail.test.ts   # GET (404, slug/id), PATCH, DELETE (soft)
├── api/register.test.ts         # validation, duplicate email, success, password hashing
├── api/cart.test.ts             # auth guards, stock checks, upsert, PATCH zero-qty removal
└── components/product-card.test.tsx  # render, discount badge, out-of-stock, click handler
```

---

## Deployment

### Vercel + Neon (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com) — Next.js is auto-detected
3. Add environment variables in the Vercel dashboard (same as `.env.local`)
4. Deploy

```bash
# Or via CLI
npx vercel --prod
```

### Environment Variables for Production

```env
DATABASE_URL="your-neon-postgres-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
```

---

## API Reference

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | — | List products — supports `search`, `category`, `minPrice`, `maxPrice`, `sortBy`, `page`, `limit` |
| `POST` | `/api/products` | Admin | Create product |
| `GET` | `/api/products/[id]` | — | Get product by id or slug |
| `PATCH` | `/api/products/[id]` | Admin | Update product fields |
| `DELETE` | `/api/products/[id]` | Admin | Soft-delete (sets `isActive: false`) |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cart` | ✓ | Get authenticated user's cart |
| `POST` | `/api/cart` | ✓ | Add item (upserts; increments if already exists) |
| `PATCH` | `/api/cart` | ✓ | Update quantity (quantity ≤ 0 removes the item) |
| `DELETE` | `/api/cart?productId=` | ✓ | Remove item |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Create account (name, email, password — Zod validated) |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth session handlers |

---

## Security

| Layer | Implementation |
|-------|----------------|
| Password hashing | bcryptjs, 12 salt rounds |
| Sessions | JWT signed with `NEXTAUTH_SECRET` |
| CSRF | Built into NextAuth |
| XSS | React escapes all output by default |
| SQL injection | Prisma parameterized queries — no raw SQL |
| Route protection | Edge middleware (runs before page render) |
| Input validation | Zod schemas on every API endpoint |
| Rate limiting | Token bucket — 5 register / 10 login attempts per IP per 15 min |
| Env validation | Zod schema in `lib/env.ts` — app refuses to start with missing vars |
| Security headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` |

---

## Database Schema

```prisma
User          → id, email, name, password (bcrypt), role (USER|ADMIN)
Product       → id, name, slug (unique), price, comparePrice, stock,
                images[], categoryId, brand, rating, reviewCount,
                isActive, isFeatured
Category      → id, name, slug, parentId (self-relation for hierarchy)
CartItem      → userId + productId (composite unique), quantity
Account       → NextAuth OAuth accounts
Session       → NextAuth sessions
```

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#0066FF` |
| Success | `#00B517` |
| Warning | `#FF9017` |
| Danger | `#FA3434` |
| Background | `#F7FAFC` |
| Font | Inter (Google Fonts) |

---

## License

MIT — see [LICENSE](./LICENSE).
