import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kycDocumentTypeEnum = pgEnum("kyc_document_type", ["passport", "drivers_license", "national_id"]);
export const kycSubmissionStatusEnum = pgEnum("kyc_submission_status", ["pending", "approved", "rejected"]);

export const kycSubmissionsTable = pgTable("kyc_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  status: kycSubmissionStatusEnum("status").notNull().default("pending"),
  documentType: kycDocumentTypeEnum("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  postalCode: text("postal_code").notNull(),
  rejectionReason: text("rejection_reason"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertKycSchema = createInsertSchema(kycSubmissionsTable).omit({ id: true, submittedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type KycSubmission = typeof kycSubmissionsTable.$inferSelect;
