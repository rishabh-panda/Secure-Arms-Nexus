import { db, auditLogsTable } from "@workspace/db";
import { Request } from "express";

export async function logAudit(
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: string,
) {
  try {
    await db.insert(auditLogsTable).values({
      userId: req.session.userId ?? null,
      userEmail: null,
      action,
      resourceType,
      resourceId: resourceId ?? null,
      details: details ?? null,
      ipAddress: (req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress ?? null,
    });
  } catch {
    // Audit log failure should not break the main flow
  }
}
