import { Router } from "express";
import { db, ordersTable, usersTable, productsTable, kycSubmissionsTable, licensesTable, auditLogsTable } from "@workspace/db";
import { sql, gte, eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/summary", requireAdmin, async (_req, res) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    revenueResult,
    ordersResult,
    pendingOrdersResult,
    usersResult,
    pendingKycResult,
    pendingLicensesResult,
    productsResult,
    lowStockResult,
    lastMonthRevenueResult,
    lastMonthOrdersResult,
    lastMonthUsersResult,
    thisMonthUsersResult,
  ] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(gte(ordersTable.createdAt, thisMonth)),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(gte(ordersTable.createdAt, thisMonth)),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(eq(ordersTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(kycSubmissionsTable).where(eq(kycSubmissionsTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(licensesTable).where(eq(licensesTable.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(productsTable),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(sql`stock_count < 10`),
    db.select({ total: sql<number>`coalesce(sum(total::numeric), 0)` }).from(ordersTable).where(sql`created_at >= ${lastMonth} and created_at <= ${lastMonthEnd}`),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(sql`created_at >= ${lastMonth} and created_at <= ${lastMonthEnd}`),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(sql`created_at >= ${lastMonth} and created_at <= ${lastMonthEnd}`),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(gte(usersTable.createdAt, thisMonth)),
  ]);

  const revenue = Number(revenueResult[0]?.total ?? 0);
  const orders = Number(ordersResult[0]?.count ?? 0);
  const lastRevenue = Number(lastMonthRevenueResult[0]?.total ?? 0);
  const lastOrders = Number(lastMonthOrdersResult[0]?.count ?? 0);
  const lastUsers = Number(lastMonthUsersResult[0]?.count ?? 0);
  const thisUsers = Number(thisMonthUsersResult[0]?.count ?? 0);

  res.json({
    totalRevenue: revenue,
    totalOrders: orders,
    pendingOrders: Number(pendingOrdersResult[0]?.count ?? 0),
    totalUsers: Number(usersResult[0]?.count ?? 0),
    pendingKyc: Number(pendingKycResult[0]?.count ?? 0),
    pendingLicenses: Number(pendingLicensesResult[0]?.count ?? 0),
    totalProducts: Number(productsResult[0]?.count ?? 0),
    lowStockProducts: Number(lowStockResult[0]?.count ?? 0),
    revenueGrowth: lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0,
    orderGrowth: lastOrders > 0 ? ((orders - lastOrders) / lastOrders) * 100 : 0,
    userGrowth: lastUsers > 0 ? ((thisUsers - lastUsers) / lastUsers) * 100 : 0,
  });
});

router.get("/dashboard/sales-trend", requireAdmin, async (req, res) => {
  const period = (req.query.period as string) || "month";
  let intervalDays = 30;
  if (period === "week") intervalDays = 7;
  if (period === "quarter") intervalDays = 90;

  const result = await db.execute(sql`
    SELECT 
      date_trunc('day', created_at)::date::text as date,
      coalesce(sum(total::numeric), 0) as revenue,
      count(*) as orders
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '1 day' * ${intervalDays}
    GROUP BY date_trunc('day', created_at)
    ORDER BY date_trunc('day', created_at)
  `);

  res.json((result.rows as Array<{ date: string; revenue: string; orders: string }>).map(r => ({
    date: r.date,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  })));
});

router.get("/dashboard/category-breakdown", requireAdmin, async (_req, res) => {
  const result = await db.execute(sql`
    SELECT 
      c.name as category,
      coalesce(sum(o_items.price * o_items.quantity), 0) as revenue
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    LEFT JOIN LATERAL (
      SELECT (item->>'price')::numeric as price, (item->>'quantity')::integer as quantity
      FROM orders, jsonb_array_elements(items::jsonb) as item
      WHERE (item->>'productId')::integer = p.id
    ) o_items ON true
    GROUP BY c.id, c.name
    ORDER BY revenue DESC
  `);

  const rows = result.rows as Array<{ category: string; revenue: string }>;
  const total = rows.reduce((sum, r) => sum + Number(r.revenue), 0);
  const colors = ["#00D4FF", "#8B5CF6", "#00FF9D", "#F59E0B", "#EF4444", "#EC4899"];

  res.json(rows.map((r, i) => ({
    category: r.category,
    revenue: Number(r.revenue),
    percentage: total > 0 ? Math.round((Number(r.revenue) / total) * 100) : 0,
    color: colors[i % colors.length],
  })));
});

router.get("/dashboard/recent-activity", requireAdmin, async (_req, res) => {
  const logs = await db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(20);

  const activityTypeMap: Record<string, string> = {
    order_placed: "order_placed",
    kyc_submitted: "kyc_submitted",
    license_submitted: "license_uploaded",
    user_register: "user_registered",
    order_status_updated: "order_shipped",
    kyc_approved: "kyc_submitted",
    kyc_rejected: "compliance_alert",
  };

  res.json(logs.map(log => ({
    id: log.id,
    type: activityTypeMap[log.action] ?? "order_placed",
    description: log.details ?? log.action.replace(/_/g, " "),
    userId: log.userId ?? null,
    userEmail: log.userEmail ?? null,
    timestamp: log.createdAt,
    severity: log.action.includes("reject") ? "warning" : "info",
  })));
});

router.get("/dashboard/user-stats", requireAdmin, async (_req, res) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, verified, pending, newThisMonth] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.kycStatus, "approved")),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.kycStatus, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(gte(usersTable.createdAt, thisMonth)),
  ]);

  const totalCount = Number(total[0]?.count ?? 0);
  const verifiedCount = Number(verified[0]?.count ?? 0);
  const pendingCount = Number(pending[0]?.count ?? 0);
  const newCount = Number(newThisMonth[0]?.count ?? 0);
  const guestCount = totalCount - verifiedCount - pendingCount;

  res.json({
    total: totalCount,
    verified: verifiedCount,
    pendingVerification: pendingCount,
    guestUsers: Math.max(0, guestCount),
    newThisMonth: newCount,
    verificationRate: totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0,
  });
});

export default router;
