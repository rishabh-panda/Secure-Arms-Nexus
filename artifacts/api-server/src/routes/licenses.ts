import { Router } from "express";
import { db, licensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SubmitLicenseBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit";

const router = Router();

function formatLicense(lic: typeof licensesTable.$inferSelect) {
  return {
    id: lic.id,
    userId: lic.userId,
    licenseType: lic.licenseType,
    licenseNumber: lic.licenseNumber,
    issuingAuthority: lic.issuingAuthority,
    issuedDate: lic.issuedDate,
    expiryDate: lic.expiryDate,
    status: lic.status,
    rejectionReason: lic.rejectionReason ?? null,
    createdAt: lic.createdAt,
  };
}

router.get("/licenses", requireAuth, async (req, res) => {
  const licenses = await db.select().from(licensesTable).where(eq(licensesTable.userId, req.session.userId!));
  res.json(licenses.map(formatLicense));
});

router.post("/licenses", requireAuth, async (req, res) => {
  const parsed = SubmitLicenseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const userId = req.session.userId!;
  const { issuedDate, expiryDate, ...rest } = parsed.data;

  const [license] = await db.insert(licensesTable).values({
    userId,
    ...rest,
    issuedDate: typeof issuedDate === "string" ? issuedDate : issuedDate.toISOString().split("T")[0],
    expiryDate: typeof expiryDate === "string" ? expiryDate : expiryDate.toISOString().split("T")[0],
    status: "pending",
  }).returning();

  await logAudit(req, "license_submitted", "license", String(license.id));
  res.status(201).json(formatLicense(license));
});

export default router;
