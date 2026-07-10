import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * REAL concurrency integration test — runs against an actual Postgres
 * database, not a mock.
 *
 * WHY THIS FILE EXISTS SEPARATELY: the regression tests in
 * __tests__/api/orders.test.ts and __tests__/api/cart.test.ts mock Prisma
 * and assert the *code* correctly handles a `count: 0` response. That
 * proves the code's logic is correct, but it does NOT prove Postgres
 * actually serializes concurrent UPDATEs to the same row the way the fix
 * assumes. This file fires two genuinely simultaneous requests at a real
 * database and checks the real outcome — the claim "Postgres prevents the
 * race" and "my code handles Postgres preventing the race" are different
 * things to verify, and this covers the first one.
 *
 * OPT-IN: skipped unless TEST_DATABASE_URL is set, so it doesn't require a
 * live database in CI or in this sandbox (which has no network access to
 * provision one). To run it:
 *
 *   TEST_DATABASE_URL="postgresql://...:5432/nexmart_test" npx vitest run __tests__/integration
 *
 * Use a disposable/test database — this creates and deletes real rows.
 */

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeIfDb = TEST_DATABASE_URL ? describe : describe.skip;

describeIfDb("Stock race condition (real Postgres)", () => {
  // Imported dynamically and only when the suite actually runs, so this
  // file doesn't require a generated Prisma client just to be collected.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  let testCategoryId: string;
  let testProductId: string;

  beforeAll(async () => {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });

    const category = await prisma.category.create({
      data: { name: "__test_category__", slug: `__test_category_${Date.now()}__` },
    });
    testCategoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: "__test_race_product__",
        slug: `__test_race_product_${Date.now()}__`,
        description: "Integration test fixture",
        price: 10,
        stock: 1, // exactly one unit — the scenario the race actually matters for
        categoryId: testCategoryId,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    if (!prisma) return;
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.category.deleteMany({ where: { id: testCategoryId } });
    await prisma.$disconnect();
  });

  it("allows only one of two simultaneous decrements to succeed when stock is 1", async () => {
    // Fire both at once — this is the actual scenario: two checkouts for
    // the last unit landing at the database within the same instant.
    const [resultA, resultB] = await Promise.all([
      prisma.product.updateMany({
        where: { id: testProductId, isActive: true, stock: { gte: 1 } },
        data: { stock: { decrement: 1 } },
      }),
      prisma.product.updateMany({
        where: { id: testProductId, isActive: true, stock: { gte: 1 } },
        data: { stock: { decrement: 1 } },
      }),
    ]);

    const successCount = [resultA, resultB].filter((r) => r.count === 1).length;
    const failureCount = [resultA, resultB].filter((r) => r.count === 0).length;

    // Exactly one must win and one must lose — not both winning (which
    // would mean the race wasn't actually closed) and not both losing
    // (which would mean something else is broken).
    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    const finalProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(finalProduct.stock).toBe(0); // never negative, never still 1
  });

  it("rejects a third decrement attempt once stock is exhausted", async () => {
    const result = await prisma.product.updateMany({
      where: { id: testProductId, isActive: true, stock: { gte: 1 } },
      data: { stock: { decrement: 1 } },
    });

    expect(result.count).toBe(0);

    const finalProduct = await prisma.product.findUnique({ where: { id: testProductId } });
    expect(finalProduct.stock).toBe(0); // still 0, not -1
  });
});
