import { Router } from "express";
import { db, kycSubmissionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { SubmitKycBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit";

const router = Router();

function formatKyc(kyc: typeof kycSubmissionsTable.$inferSelect | null, userId: number) {
  if (!kyc) {
    return { status: "not_submitted" as const, id: null, submittedAt: null, reviewedAt: null, rejectionReason: null };
  }
  return {
    id: kyc.id,
    status: kyc.status as "pending" | "approved" | "rejected",
    submittedAt: kyc.submittedAt,
    reviewedAt: kyc.reviewedAt ?? null,
    rejectionReason: kyc.rejectionReason ?? null,
  };
}

router.get("/kyc", requireAuth, async (req, res) => {
  const [kyc] = await db.select().from(kycSubmissionsTable).where(eq(kycSubmissionsTable.userId, req.session.userId!)).limit(1);
  res.json(formatKyc(kyc ?? null, req.session.userId!));
});

router.post("/kyc", requireAuth, async (req, res) => {
  const parsed = SubmitKycBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation error", message: parsed.error.message }); return; }

  const userId = req.session.userId!;

  const existing = await db.select().from(kycSubmissionsTable).where(eq(kycSubmissionsTable.userId, userId)).limit(1);
  if (existing.length > 0 && existing[0].status === "approved") {
    res.status(400).json({ error: "Already approved", message: "Your KYC is already approved" });
    return;
  }

  const { dateOfBirth, ...rest } = parsed.data;
  const dateOfBirthStr = typeof dateOfBirth === "string" ? dateOfBirth : dateOfBirth.toISOString().split("T")[0];

  let kyc;
  if (existing.length > 0) {
    [kyc] = await db.update(kycSubmissionsTable).set({
      ...rest,
      dateOfBirth: dateOfBirthStr,
      status: "pending",
      rejectionReason: null,
      reviewedAt: null,
      submittedAt: new Date(),
    }).where(eq(kycSubmissionsTable.userId, userId)).returning();
  } else {
    [kyc] = await db.insert(kycSubmissionsTable).values({
      userId,
      ...rest,
      dateOfBirth: dateOfBirthStr,
      status: "pending",
    }).returning();
  }

  await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.id, userId));
  await logAudit(req, "kyc_submitted", "kyc", String(kyc.id));

  res.json(formatKyc(kyc, userId));
});

export default router;
