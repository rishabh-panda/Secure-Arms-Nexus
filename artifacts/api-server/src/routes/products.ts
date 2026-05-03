import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, like, sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { CreateProductBody } from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res) => {
  const { category, type, minPrice, maxPrice, search, brand, inStock, page = "1", limit = "20" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (category) conditions.push(eq(productsTable.categoryId, parseInt(category)));
  if (type) conditions.push(eq(productsTable.type, type as "firearm" | "ammunition" | "accessory"));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
  if (search) conditions.push(like(productsTable.name, `%${search}%`));
  if (brand) conditions.push(eq(productsTable.brand, brand));
  if (inStock === "true") conditions.push(gte(productsTable.stockCount, 1));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, countResult] = await Promise.all([
    db.select({
      id: productsTable.id,
      name: productsTable.name,
      description: productsTable.description,
      price: productsTable.price,
      categoryId: productsTable.categoryId,
      categoryName: categoriesTable.name,
      brand: productsTable.brand,
      type: productsTable.type,
      caliber: productsTable.caliber,
      stockCount: productsTable.stockCount,
      imageUrl: productsTable.imageUrl,
      requiresLicense: productsTable.requiresLicense,
      restrictedJurisdictions: productsTable.restrictedJurisdictions,
      isFeatured: productsTable.isFeatured,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      createdAt: productsTable.createdAt,
    })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(productsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  res.json({
    items: products.map(p => ({ ...p, categoryName: p.categoryName ?? "" })),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get("/products/featured", async (_req, res) => {
  const featured = await db.select({
    id: productsTable.id,
    name: productsTable.name,
    description: productsTable.description,
    price: productsTable.price,
    categoryId: productsTable.categoryId,
    categoryName: categoriesTable.name,
    brand: productsTable.brand,
    type: productsTable.type,
    caliber: productsTable.caliber,
    stockCount: productsTable.stockCount,
    imageUrl: productsTable.imageUrl,
    requiresLicense: productsTable.requiresLicense,
    restrictedJurisdictions: productsTable.restrictedJurisdictions,
    isFeatured: productsTable.isFeatured,
    rating: productsTable.rating,
    reviewCount: productsTable.reviewCount,
    createdAt: productsTable.createdAt,
  })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.isFeatured, true))
    .limit(6);

  res.json(featured.map(p => ({ ...p, categoryName: p.categoryName ?? "" })));
});

router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [product] = await db.select({
    id: productsTable.id,
    name: productsTable.name,
    description: productsTable.description,
    price: productsTable.price,
    categoryId: productsTable.categoryId,
    categoryName: categoriesTable.name,
    brand: productsTable.brand,
    type: productsTable.type,
    caliber: productsTable.caliber,
    stockCount: productsTable.stockCount,
    imageUrl: productsTable.imageUrl,
    requiresLicense: productsTable.requiresLicense,
    restrictedJurisdictions: productsTable.restrictedJurisdictions,
    isFeatured: productsTable.isFeatured,
    rating: productsTable.rating,
    reviewCount: productsTable.reviewCount,
    specs: productsTable.specs,
    safetyInfo: productsTable.safetyInfo,
    legalRequirements: productsTable.legalRequirements,
    model3dUrl: productsTable.model3dUrl,
    createdAt: productsTable.createdAt,
  })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (!product) { res.status(404).json({ error: "Not found", message: "Product not found" }); return; }

  res.json({ ...product, categoryName: product.categoryName ?? "" });
});

router.post("/products", requireAdmin, async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const { specs, ...rest } = parsed.data;
  const [product] = await db.insert(productsTable).values({
    ...rest,
    caliber: rest.caliber ?? null,
    imageUrl: rest.imageUrl ?? null,
    specs: specs ?? [],
  }).returning();

  res.status(201).json(product);
});

router.put("/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const { specs, ...rest } = parsed.data;
  const [product] = await db.update(productsTable).set({
    ...rest,
    caliber: rest.caliber ?? null,
    imageUrl: rest.imageUrl ?? null,
    specs: specs ?? [],
    updatedAt: new Date(),
  }).where(eq(productsTable.id, id)).returning();

  if (!product) { res.status(404).json({ error: "Not found" }); return; }
  res.json(product);
});

router.delete("/products/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Product deleted" });
});

export default router;
