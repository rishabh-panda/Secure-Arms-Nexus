import { Router } from "express";
import { db, cartItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { AddToCartBody, UpdateCartItemBody } from "@workspace/api-zod";

const router = Router();

async function getCartForUser(userId: number) {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      productName: productsTable.name,
      price: productsTable.price,
      quantity: cartItemsTable.quantity,
      imageUrl: productsTable.imageUrl,
      requiresLicense: productsTable.requiresLicense,
      type: productsTable.type,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const validItems = items.filter(i => i.productName !== null).map(i => ({
    productId: i.productId,
    productName: i.productName!,
    price: Number(i.price),
    quantity: i.quantity,
    imageUrl: i.imageUrl ?? null,
    requiresLicense: i.requiresLicense ?? false,
    type: i.type ?? "accessory",
  }));

  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = validItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: validItems, subtotal, itemCount };
}

router.get("/cart", requireAuth, async (req, res) => {
  const cart = await getCartForUser(req.session.userId!);
  res.json(cart);
});

router.post("/cart/items", requireAuth, async (req, res) => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const { productId, quantity } = parsed.data;
  const userId = req.session.userId!;

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const [existing] = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing) {
    await db.update(cartItemsTable).set({ quantity: existing.quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }

  const cart = await getCartForUser(userId);
  res.json(cart);
});

router.put("/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = parseInt(req.params.productId);
  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const { quantity } = parsed.data;
  const userId = req.session.userId!;

  if (quantity === 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  } else {
    await db.update(cartItemsTable).set({ quantity, updatedAt: new Date() })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  }

  const cart = await getCartForUser(userId);
  res.json(cart);
});

router.delete("/cart/items/:productId", requireAuth, async (req, res) => {
  const productId = parseInt(req.params.productId);
  await db.delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, req.session.userId!), eq(cartItemsTable.productId, productId)));

  const cart = await getCartForUser(req.session.userId!);
  res.json(cart);
});

router.delete("/cart/clear", requireAuth, async (req, res) => {
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, req.session.userId!));
  res.json({ message: "Cart cleared" });
});

router.post("/cart/validate", requireAuth, async (req, res) => {
  const cart = await getCartForUser(req.session.userId!);
  const issues: string[] = [];
  const requiresLicense = cart.items.some(i => i.requiresLicense);

  if (cart.items.length === 0) issues.push("Your cart is empty");
  if (requiresLicense) issues.push("One or more items require a valid firearms license");

  res.json({
    isEligible: issues.length === 0 || (issues.length === 1 && requiresLicense),
    issues,
    requiresLicense,
    kycRequired: requiresLicense,
  });
});

export default router;
