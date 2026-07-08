<div align="center">

# NexMart

### Production-grade full-stack eCommerce platform

[![CI](https://github.com/ahmedabbas52233-a11y/NexMart/actions/workflows/ci.yml/badge.svg)](https://github.com/ahmedabbas52233-a11y/NexMart/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.14-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-121%20passing-brightgreen?logo=vitest)](./\_\_tests\_\_)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

[**Live Demo**](https://nex-mart-chi.vercel.app/) · [**Report Bug**](https://github.com/ahmedabbas52233-a11y/NexMart/issues) · [**Request Feature**](https://github.com/ahmedabbas52233-a11y/NexMart/issues)

</div>

---

## Screenshots

| Home | Products | Cart |
|------|----------|------|
| ![Home](/Screenshots/Home-page.png) | ![Products](/Screenshots/Products.png) | ![Cart](/Screenshots/Cart.png) |

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
│  │  Zustand    │  │  NextAuth   │  │  Zod Validation  │   │
│  │   Store     │  │   Session   │  │   (Forms/API)    │   │
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
| **Radix Slot** | Composition | `@radix-ui/react-slot` powers the Button's `asChild` pattern — the only Radix primitive actually used |
| **Zod** | Validation | Runtime schema validation on all API inputs; inferred TypeScript types |
| **bcryptjs** | Password hashing | 12 salt rounds (~250ms) — slow enough to resist brute force |
| **Vitest** | Testing | Vite-native, fast HMR test runner with native ESM and TypeScript support |

---

## Features

**Storefront**
- Responsive design (mobile-first; breakpoints: sm / md / lg / xl)
- Home page with hero banner, category grid, deals section, featured and recommended products
- Product listing with search, filter by category and price range, sort by price / rating / newest
- Product detail page with a working multi-image gallery, add-to-cart with quantity selector, related products
- Slide-over cart drawer with live item count badge
- Full cart page with quantity controls and order summary
- Wishlist — save products for later, with a live count badge in the header
- Checkout — real shipping-address form, server-side stock re-validation, order creation (demo only: no real payment is processed)
- Order history and order detail/confirmation pages
- Static content pages: About, Contact, FAQ, Privacy Policy, Terms & Conditions
- `sitemap.xml` and `robots.txt` generated from live category/product data

**Authentication**
- Email/password registration with Zod validation
- JWT sessions via NextAuth (30-day expiry)
- Role-based access control: `USER` vs `ADMIN`
- Edge middleware route protection for `/admin` — server-side, not client-side guards
- Google OAuth integration (configure `GOOGLE_CLIENT_ID` to enable)
- Rate-limited login (10 attempts / 15 min per IP) — prevents credential brute-forcing
- Forgot/reset password flow with single-use, hashed, expiring tokens (email sent via Resend if configured, otherwise logged to the console for local testing)

**Admin Panel** (`/admin` — ADMIN role required, enforced in middleware)
- Dashboard: inventory value, low-stock alerts, recently added products
- Product CRUD: create, edit, soft-delete, with category selection and image upload (via Vercel Blob, optional) or manual URL
- Orders: view all orders, update fulfillment status
- Customers: view registered users with order count and lifetime spend
- Analytics: real revenue-by-day chart and top products, computed from actual order data (last 30 days)
- Settings: read-only overview of store configuration constants

**Cart & Checkout**
- Server-side persistence (PostgreSQL) — survives page refresh and device switches
- Optimistic UI updates with automatic rollback on API error
- Upsert logic: adding the same product increments quantity
- Stock validation against the *cumulative* cart quantity, not just each increment
- Checkout runs in a single database transaction: re-validates stock, decrements it, snapshots line items, and clears the cart — all or nothing

**Security**
- Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy on every response
- Passwords hashed with bcrypt (12 rounds); reset tokens hashed with SHA-256 before storage
- No user enumeration on the forgot-password endpoint
- Admin API routes (`products`, `orders`) require and verify the `ADMIN` role server-side

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
│   ├── admin/                    # Dashboard, products, orders, customers, analytics, settings
│   ├── checkout/page.tsx         # Checkout form
│   ├── orders/[id]/page.tsx      # Order confirmation / detail
│   ├── profile/page.tsx          # Account overview + order history
│   ├── wishlist/page.tsx         # Saved products
│   ├── about/, contact/, faq/, privacy/, terms/   # Static content pages
│   ├── sitemap.ts, robots.ts     # SEO
│   ├── api/
│   │   ├── auth/register/, forgot-password/, reset-password/
│   │   ├── auth/[...nextauth]/   # NextAuth handlers
│   │   ├── products/             # Product CRUD API (public GET, admin POST/PATCH/DELETE)
│   │   ├── cart/, wishlist/, orders/
│   │   └── admin/                # products, orders, customers, analytics, upload
│   └── auth/                     # Sign-in / sign-up / forgot / reset pages
├── components/
│   ├── ui/                       # Button, Input, Badge, Skeleton
│   ├── layout/                   # Header, Footer, CartDrawer, Providers
│   └── product/                  # ProductCard, ProductGallery, ProductActions, AddToCartButton
├── hooks/
│   ├── useCart.ts                # Zustand store (state + computed)
│   ├── useCartAPI.ts             # API calls with optimistic updates
│   └── useWishlist.ts            # Wishlist state + optimistic toggle
├── lib/
│   ├── utils.ts                  # cn(), formatPrice(), order totals, slugify()
│   ├── db.ts                     # Prisma singleton
│   ├── auth.ts                   # NextAuth configuration (rate-limited credentials + optional Google)
│   ├── categories.ts             # Cached category fetch (unstable_cache)
│   ├── email.ts                  # Password reset email (Resend, with console fallback)
│   ├── env.ts                    # Zod env validation — fails fast on missing vars
│   └── rate-limit.ts             # In-memory token bucket rate limiter
├── __tests__/                    # Vitest test suite (121 tests)
│   ├── lib/                      # utils, rate-limit, auth (authorize + rate limiting)
│   ├── hooks/useCart.test.ts     # Zustand store tests
│   ├── api/                      # cart, products, orders, wishlist route tests
│   ├── middleware.test.ts        # Admin route protection tests
│   └── components/               # ProductCard, Header, Footer
├── prisma/
│   ├── schema.prisma             # Database schema (users, products, cart, wishlist, orders)
│   └── seed.ts                   # Sample data — real, verified product photos (Pexels)
├── types/                        # Shared TypeScript interfaces
├── middleware.ts                 # Edge route protection + security headers
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
git clone https://github.com/ahmedabbas52233-a11y/NexMart.git
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

# Vercel Blob (optional — real image uploads in the admin product form)
BLOB_READ_WRITE_TOKEN=""

# Resend (optional — real password-reset emails; otherwise logged to console)
RESEND_API_KEY=""
EMAIL_FROM="NexMart <onboarding@resend.dev>"

# Seed credentials
ADMIN_EMAIL="admin@nexmart.com"
ADMIN_PASSWORD="Admin123!"
```

### 3. Database Setup

```bash
npx prisma generate      # generate the Prisma client
npx prisma db push       # push schema to your database
npm run db:seed          # seed 12 products across 5 categories + admin user
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

**Coverage targets:** 35% lines / statements, 45% functions, 55% branches (enforced in CI via `vitest.config.ts`; actual current coverage exceeds all four).

Test files live in `__tests__/` mirroring the source structure:

```
__tests__/
├── lib/utils.test.ts            # cn, formatPrice, calculateDiscount, calculateOrderTotals, slugify
├── lib/rate-limit.test.ts       # token bucket logic, window reset, per-IP isolation, all limiters
├── lib/auth.test.ts             # credentials authorize(): rate limiting, bad creds, valid login
├── hooks/useCart.test.ts        # addItem, removeItem, updateQuantity, totalItems, totalPrice
├── middleware.test.ts           # admin route redirect, security headers
├── api/products.test.ts         # public GET, admin-only POST/PATCH/DELETE
├── api/cart.test.ts             # auth guards, cumulative stock validation, upsert, PATCH/DELETE
├── api/orders.test.ts           # checkout transaction, stock re-check, ownership access control
├── api/wishlist.test.ts         # auth guards, idempotent add, remove
├── components/Product-card.test.tsx  # render, discount badge, out-of-stock, click handler
├── components/layout/header.test.tsx
└── components/layout/footer.test.tsx
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
| `POST` | `/api/cart` | ✓ | Add item (validates cumulative quantity against stock) |
| `PATCH` | `/api/cart` | ✓ | Set absolute quantity (0 removes the item; validated against stock) |
| `DELETE` | `/api/cart?productId=` | ✓ | Remove item |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/wishlist` | ✓ | Get saved products |
| `POST` | `/api/wishlist` | ✓ | Save a product (idempotent) |
| `DELETE` | `/api/wishlist?productId=` | ✓ | Remove a saved product |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/orders` | ✓ | List the current user's orders |
| `POST` | `/api/orders` | ✓ | Checkout — creates an order from the cart in a single transaction (re-validates stock, decrements it, clears cart) |
| `GET` | `/api/orders/[id]` | ✓ | Get an order (owner or admin only) |

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Create account (name, email, password — Zod validated) |
| `POST` | `/api/auth/forgot-password` | — | Request a reset link (rate-limited; no user enumeration) |
| `POST` | `/api/auth/reset-password` | — | Reset password with a valid token |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth session handlers (rate-limited credentials login) |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/products` | Admin | List all products (including inactive) |
| `GET` | `/api/admin/orders` | Admin | List all orders across all users |
| `PATCH` | `/api/admin/orders/[id]` | Admin | Update order fulfillment status |
| `GET` | `/api/admin/customers` | Admin | List users with order count and lifetime spend |
| `GET` | `/api/admin/analytics` | Admin | Revenue-by-day and top-products aggregates (last 30 days) |
| `POST` | `/api/admin/upload` | Admin | Upload a product image to Vercel Blob (if configured) |

---

## Security

| Layer | Implementation |
|-------|----------------|
| Password hashing | bcryptjs, 12 salt rounds |
| Sessions | JWT signed with `NEXTAUTH_SECRET` |
| Login brute-forcing | Rate-limited (10 attempts / 15 min per IP) |
| Password reset | Single-use, SHA-256-hashed, 1-hour-expiring tokens; no user enumeration |
| CSRF | Built into NextAuth |
| XSS | React escapes all output by default |
| SQL injection | Prisma parameterized queries — no raw SQL |
| Headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy on every response |
| Admin routes | Verified server-side in middleware (JWT role check) and in every admin API route |
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
WishlistItem  → userId + productId (composite unique)
Order         → orderNumber (unique), userId, status, subtotal/shipping/tax/total,
                shipping address fields
OrderItem     → orderId, productId (nullable — survives product deletion),
                productName/productImage/price snapshotted at purchase time
PasswordResetToken → email, tokenHash (unique, SHA-256), expiresAt, usedAt
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
