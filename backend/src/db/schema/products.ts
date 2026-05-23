import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const products = pgTable("products", {
  skuId: varchar("sku_id", { length: 64 }).primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productTitle: text("product_title"),
  description: text("description"),
  brand: text("brand"),
  category: text("category"),
  price: integer("price"),
  mrp: integer("mrp"),
  imageUrl: text("image_url"),
  productUrl: text("product_url"),
  availability: text("availability"),
  color: text("color"),
  size: text("size"),
  material: text("material"),
  qualityScore: integer("quality_score").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
