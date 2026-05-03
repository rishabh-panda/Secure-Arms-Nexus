import { Router } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      productCount: sql<number>`(select count(*) from products where products.category_id = categories.id)`,
    })
    .from(categoriesTable);

  res.json(categories);
});

export default router;
