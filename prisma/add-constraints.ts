import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Adds database-level CHECK constraints that Prisma's schema DSL can't
 * express declaratively (there is no `@@check` attribute — see
 * https://github.com/prisma/prisma/issues/3388, open since 2019). Since
 * this project uses `prisma db push` rather than `migrate` (no migrations
 * directory — see .gitignore), there's no migration file to hand-edit
 * either, so this runs the raw SQL directly.
 *
 * WHY THIS MATTERS ALONGSIDE THE ATOMIC APPLICATION-LEVEL GUARDS (see
 * app/api/orders/route.ts and app/api/cart/route.ts): those guards are
 * correct, but they're the *only* thing preventing negative stock — pure
 * application-code enforcement. This constraint is a second, independent
 * line of defense against any future code path that touches `stock`
 * without going through that exact logic: a bulk-import script, a manual
 * SQL fix, a new endpoint someone adds without knowing this rule exists.
 * With the constraint in place, the database itself refuses the write.
 *
 * Idempotent — safe to run multiple times (checks for existence first,
 * and separately tolerates Postgres error 42710 "already exists").
 *
 * Run manually after `prisma db push`:
 *   npm run db:constraints
 */
async function addConstraints() {
  const constraints = [
    {
      name: "products_stock_non_negative",
      sql: `ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK (stock >= 0)`,
    },
    {
      name: "order_items_quantity_positive",
      sql: `ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK (quantity > 0)`,
    },
    {
      name: "cart_items_quantity_positive",
      sql: `ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_quantity_positive" CHECK (quantity > 0)`,
    },
  ];

  for (const constraint of constraints) {
    try {
      const exists = await prisma.$queryRaw<{ exists: boolean }[]>`
        SELECT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = ${constraint.name}
        ) as exists
      `;

      if (exists[0]?.exists) {
        console.log(`✓ Constraint "${constraint.name}" already exists, skipping`);
        continue;
      }

      await prisma.$executeRawUnsafe(constraint.sql);
      console.log(`✓ Added constraint "${constraint.name}"`);
    } catch (error) {
      // Postgres 42710 = duplicate_object ("already exists") — safe to ignore,
      // covers a race between the existence check and the ALTER TABLE above.
      const pgError = error as { code?: string; message?: string };
      if (pgError.code === "42710" || pgError.message?.includes("already exists")) {
        console.log(`✓ Constraint "${constraint.name}" already exists, skipping`);
      } else {
        console.error(`✗ Failed to add constraint "${constraint.name}":`, error);
        throw error;
      }
    }
  }
}

addConstraints()
  .then(() => {
    console.log("\n✅ Database constraints up to date");
  })
  .catch((error) => {
    console.error("\n❌ Failed to add database constraints:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
