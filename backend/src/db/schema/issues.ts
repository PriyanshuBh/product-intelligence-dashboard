import { pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";
import { products } from "./products";

export const listingIssues = pgTable("listing_issues", {
  id: serial("id").primaryKey(),
  skuId: varchar("sku_id", { length: 64 })
    .references(() => products.skuId, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  severity: text("severity").$type<"HIGH" | "MEDIUM" | "LOW">().notNull(),
  message: text("message").notNull(),
  suggestedFix: text("suggested_fix").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type ListingIssue = typeof listingIssues.$inferSelect;
export type NewListingIssue = typeof listingIssues.$inferInsert;
