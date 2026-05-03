import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const licenseTypeEnum = pgEnum("license_type", ["firearms_dealer", "concealed_carry", "hunting", "collector"]);
export const licenseStatusEnum = pgEnum("license_status", ["pending", "approved", "rejected", "expired"]);

export const licensesTable = pgTable("licenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  licenseType: licenseTypeEnum("license_type").notNull(),
  licenseNumber: text("license_number").notNull(),
  issuingAuthority: text("issuing_authority").notNull(),
  issuedDate: text("issued_date").notNull(),
  expiryDate: text("expiry_date").notNull(),
  status: licenseStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLicenseSchema = createInsertSchema(licensesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licensesTable.$inferSelect;
