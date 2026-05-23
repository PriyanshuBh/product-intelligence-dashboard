import {
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  jsonb
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const titleEnhancements = pgTable("title_enhancements", {
  id: serial("id").primaryKey(),
  skuId: varchar("sku_id", { length: 64 })
    .references(() => products.skuId, { onDelete: "cascade" })
    .notNull(),
  originalTitle: text("original_title").notNull(),
  attributesJson: jsonb("attributes_json"),
  keywordsJson: jsonb("keywords_json"),
  enhancedTitle: text("enhanced_title").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type TitleEnhancement = typeof titleEnhancements.$inferSelect;
