import { Router } from "express";
import { db, ordersTable, cartItemsTable, productsTable, usersTable, auditLogsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { CreateOrderBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit";

const router = Router();

function formatOrder(order: typeof ordersTable.$inferSelect) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    items: order.items,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    shippingAddress: order.shippingAddress,
    complianceNotes: order.complianceNotes ?? null,
    trackingNumber: order.trackingNumber ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

router.get("/orders", requireAuth, async (req, res) => {
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  const userId = req.session.userId!;
  const conditions = [eq(ordersTable.userId, userId)];
  if (status) conditions.push(eq(ordersTable.status, status as typeof ordersTable.$inferSelect["status"]));

  const where = and(...conditions);

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limitNum).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({ items: orders.map(formatOrder), total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
});

router.post("/orders", requireAuth, async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  if (!parsed.data.consentGiven) {
    res.status(400).json({ error: "Consent required", message: "You must provide consent to proceed" });
    return;
  }

  const userId = req.session.userId!;

  const cartItems = await db.select({
    productId: cartItemsTable.productId,
    productName: productsTable.name,
    price: productsTable.price,
    quantity: cartItemsTable.quantity,
    requiresLicense: productsTable.requiresLicense,
  })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Empty cart", message: "Your cart is empty" });
    return;
  }

  const items = cartItems.map(i => ({
    productId: i.productId,
    productName: i.productName ?? "Unknown",
    price: Number(i.price),
    quantity: i.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const requiresLicense = cartItems.some(i => i.requiresLicense);

  const [order] = await db.insert(ordersTable).values({
    userId,
    status: requiresLicense ? "compliance_review" : "pending",
    items,
    subtotal: String(subtotal),
    total: String(total),
    shippingAddress: parsed.data.shippingAddress,
    licenseIds: parsed.data.licenseIds ?? [],
    consentGiven: 1,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  await logAudit(req, "order_placed", "order", String(order.id), `Total: $${total}`);

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [order] = await db.select().from(ordersTable)
    .where(and(eq(ordersTable.id, id), eq(ordersTable.userId, req.session.userId!)))
    .limit(1);

  if (!order) { res.status(404).json({ error: "Not found", message: "Order not found" }); return; }
  res.json(formatOrder(order));
});

export default router;
