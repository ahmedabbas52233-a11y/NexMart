import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { serialize } from "@/lib/utils";

/**
 * Cached for 5 minutes and tagged "categories" so admin category changes
 * can invalidate it on demand via revalidateTag. This lets the rest of the
 * site (product pages, home page) keep static/ISR rendering instead of
 * being forced dynamic just because the header needs category data.
 */
export const getNavCategories = unstable_cache(
  async () => {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { name: true, slug: true },
      });
      return serialize(categories);
    } catch (error) {
      console.error("[NAV_CATEGORIES]", error);
      return [];
    }
  },
  ["nav-categories"],
  { revalidate: 300, tags: ["categories"] }
);
