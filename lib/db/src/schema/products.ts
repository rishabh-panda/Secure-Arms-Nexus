import { pgTable, serial, text, numeric, integer, boolean, timestamp, pgEnum, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productTypeEnum = pgEnum("product_type", ["firearm", "ammunition", "accessory"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").notNull().references(() => categoriesTable.id),
  brand: text("brand").notNull(),
  type: productTypeEnum("type").notNull(),
  caliber: text("caliber"),
  stockCount: integer("stock_count").notNull().default(0),
  imageUrl: text("image_url"),
  requiresLicense: boolean("requires_license").notNull().default(false),
  restrictedJurisdictions: json("restricted_jurisdictions").$type<string[]>().notNull().default([]),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  specs: json("specs").$type<Array<{ label: string; value: string; unit?: string }>>().notNull().default([]),
  safetyInfo: text("safety_info").notNull().default(""),
  legalRequirements: text("legal_requirements").notNull().default(""),
  model3dUrl: text("model_3d_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
