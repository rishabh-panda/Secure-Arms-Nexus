import { Router } from "express";
import { db, usersTable, kycSubmissionsTable, licensesTable, ordersTable, auditLogsTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";
import { AdminUpdateUserRoleBody, AdminRejectKycBody, AdminRejectLicenseBody, AdminUpdateOrderStatusBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit";

const router = Router();

// Users
router.get("/admin/users", requireAdmin, async (req, res) => {
  const { role, kycStatus, page = "1" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = [];
  if (role) conditions.push(eq(usersTable.role, role as typeof usersTable.$inferSelect["role"]));
  if (kycStatus) conditions.push(eq(usersTable.kycStatus, kycStatus as typeof usersTable.$inferSelect["kycStatus"]));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [users, countResult] = await Promise.all([
    db.select({
      id: usersTable.id,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      role: usersTable.role,
      kycStatus: usersTable.kycStatus,
      isAgeVerified: usersTable.isAgeVerified,
      createdAt: usersTable.createdAt,
    }).from(usersTable).where(where).orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({ items: users, total, page: pageNum, totalPages: Math.ceil(total / limit) });
});

router.put("/admin/users/:id/role", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = AdminUpdateUserRoleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error" }); return; }

  const [user] = await db.update(usersTable).set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "Not found" }); return; }

  await logAudit(req, "user_role_updated", "user", String(id), `Role set to ${parsed.data.role}`);
  res.json({
    id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
    role: user.role, kycStatus: user.kycStatus, isAgeVerified: user.isAgeVerified, createdAt: user.createdAt,
  });
});

// KYC Admin
router.get("/admin/kyc", requireAdmin, async (req, res) => {
  const { status } = req.query as Record<string, string>;
  const conditions = [];
  if (status) conditions.push(eq(kycSubmissionsTable.status, status as typeof kycSubmissionsTable.$inferSelect["status"]));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db.select({
    id: kycSubmissionsTable.id,
    userId: kycSubmissionsTable.userId,
    status: kycSubmissionsTable.status,
    documentType: kycSubmissionsTable.documentType,
    documentNumber: kycSubmissionsTable.documentNumber,
    dateOfBirth: kycSubmissionsTable.dateOfBirth,
    address: kycSubmissionsTable.address,
    submittedAt: kycSubmissionsTable.submittedAt,
    rejectionReason: kycSubmissionsTable.rejectionReason,
    userEmail: usersTable.email,
    userFirstName: usersTable.firstName,
    userLastName: usersTable.lastName,
  })
    .from(kycSubmissionsTable)
    .leftJoin(usersTable, eq(kycSubmissionsTable.userId, usersTable.id))
    .where(where)
    .orderBy(desc(kycSubmissionsTable.submittedAt));

  res.json(rows.map(r => ({
    id: r.id,
    userId: r.userId,
    userEmail: r.userEmail ?? "",
    userFullName: `${r.userFirstName ?? ""} ${r.userLastName ?? ""}`.trim(),
    status: r.status,
    documentType: r.documentType,
    documentNumber: r.documentNumber,
    dateOfBirth: r.dateOfBirth,
    address: r.address,
    submittedAt: r.submittedAt,
    rejectionReason: r.rejectionReason ?? null,
  })));
});

router.post("/admin/kyc/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [kyc] = await db.update(kycSubmissionsTable).set({ status: "approved", reviewedAt: new Date() })
    .where(eq(kycSubmissionsTable.id, id)).returning();
  if (!kyc) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(usersTable).set({ kycStatus: "approved", role: "verified_buyer", updatedAt: new Date() })
    .where(eq(usersTable.id, kyc.userId));
  await logAudit(req, "kyc_approved", "kyc", String(id));

  res.json({ id: kyc.id, status: kyc.status, submittedAt: kyc.submittedAt, reviewedAt: kyc.reviewedAt, rejectionReason: null });
});

router.post("/admin/kyc/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = AdminRejectKycBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error" }); return; }

  const [kyc] = await db.update(kycSubmissionsTable).set({ status: "rejected", reviewedAt: new Date(), rejectionReason: parsed.data.reason })
    .where(eq(kycSubmissionsTable.id, id)).returning();
  if (!kyc) { res.status(404).json({ error: "Not found" }); return; }

  await db.update(usersTable).set({ kycStatus: "rejected", updatedAt: new Date() }).where(eq(usersTable.id, kyc.userId));
  await logAudit(req, "kyc_rejected", "kyc", String(id), parsed.data.reason);

  res.json({ id: kyc.id, status: kyc.status, submittedAt: kyc.submittedAt, reviewedAt: kyc.reviewedAt, rejectionReason: kyc.rejectionReason });
});

// License Admin
router.post("/admin/licenses/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [lic] = await db.update(licensesTable).set({ status: "approved", updatedAt: new Date() })
    .where(eq(licensesTable.id, id)).returning();
  if (!lic) { res.status(404).json({ error: "Not found" }); return; }

  await logAudit(req, "license_approved", "license", String(id));
  res.json({ id: lic.id, userId: lic.userId, licenseType: lic.licenseType, licenseNumber: lic.licenseNumber,
    issuingAuthority: lic.issuingAuthority, issuedDate: lic.issuedDate, expiryDate: lic.expiryDate,
    status: lic.status, rejectionReason: null, createdAt: lic.createdAt });
});

router.post("/admin/licenses/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = AdminRejectLicenseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error" }); return; }

  const [lic] = await db.update(licensesTable).set({ status: "rejected", rejectionReason: parsed.data.reason, updatedAt: new Date() })
    .where(eq(licensesTable.id, id)).returning();
  if (!lic) { res.status(404).json({ error: "Not found" }); return; }

  await logAudit(req, "license_rejected", "license", String(id), parsed.data.reason);
  res.json({ id: lic.id, userId: lic.userId, licenseType: lic.licenseType, licenseNumber: lic.licenseNumber,
    issuingAuthority: lic.issuingAuthority, issuedDate: lic.issuedDate, expiryDate: lic.expiryDate,
    status: lic.status, rejectionReason: lic.rejectionReason, createdAt: lic.createdAt });
});

// Orders Admin
router.get("/admin/orders", requireAdmin, async (req, res) => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(ordersTable.status, status as typeof ordersTable.$inferSelect["status"]));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [orders, countResult] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const formatOrder = (o: typeof ordersTable.$inferSelect) => ({
    id: o.id, userId: o.userId, status: o.status, items: o.items,
    subtotal: Number(o.subtotal), total: Number(o.total), shippingAddress: o.shippingAddress,
    complianceNotes: o.complianceNotes, trackingNumber: o.trackingNumber, createdAt: o.createdAt, updatedAt: o.updatedAt,
  });
  res.json({ items: orders.map(formatOrder), total, page: pageNum, limit, totalPages: Math.ceil(total / limit) });
});

router.put("/admin/orders/:id/status", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = AdminUpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error" }); return; }

  const [order] = await db.update(ordersTable).set({
    status: parsed.data.status,
    complianceNotes: parsed.data.complianceNotes ?? null,
    trackingNumber: parsed.data.trackingNumber ?? null,
    updatedAt: new Date(),
  }).where(eq(ordersTable.id, id)).returning();

  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  await logAudit(req, "order_status_updated", "order", String(id), `Status: ${parsed.data.status}`);

  res.json({
    id: order.id, userId: order.userId, status: order.status, items: order.items,
    subtotal: Number(order.subtotal), total: Number(order.total), shippingAddress: order.shippingAddress,
    complianceNotes: order.complianceNotes, trackingNumber: order.trackingNumber, createdAt: order.createdAt, updatedAt: order.updatedAt,
  });
});

// Audit Logs
router.get("/admin/audit-logs", requireAdmin, async (req, res) => {
  const { userId, action, page = "1" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limit = 50;
  const offset = (pageNum - 1) * limit;

  const conditions = [];
  if (userId) conditions.push(eq(auditLogsTable.userId, parseInt(userId)));
  if (action) conditions.push(eq(auditLogsTable.action, action));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, countResult] = await Promise.all([
    db.select().from(auditLogsTable).where(where).orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(auditLogsTable).where(where),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  res.json({ items: logs, total, page: pageNum, totalPages: Math.ceil(total / limit) });
});

export default router;
