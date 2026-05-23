import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar,
  serial
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const competitorPrices = pgTable("competitor_prices", {
  id: serial("id").primaryKey(),
  skuId: varchar("sku_id", { length: 64 })
    .references(() => products.skuId, { onDelete: "cascade" })
    .notNull(),
  platform: text("platform").notNull(),
  competitorUrl: text("competitor_url"),
  competitorPrice: integer("competitor_price").notNull(),
  currency: text("currency").default("INR").notNull(),
  source: text("source")
    .$type<"mock" | "csv" | "manual">()
    .default("mock")
    .notNull(),
  fetchedAt: timestamp("fetched_at").defaultNow().notNull()
});

export type CompetitorPrice = typeof competitorPrices.$inferSelect;
export type NewCompetitorPrice = typeof competitorPrices.$inferInsert;
