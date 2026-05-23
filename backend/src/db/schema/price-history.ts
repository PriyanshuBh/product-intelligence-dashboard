import {
  pgTable,
  text,
  integer,
  timestamp,
  varchar,
  serial
} from "drizzle-orm/pg-core";
import { products } from "./products";

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  skuId: varchar("sku_id", { length: 64 })
    .references(() => products.skuId, { onDelete: "cascade" })
    .notNull(),
  platform: text("platform").notNull(),
  price: integer("price").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull()
});

export type PriceHistoryRow = typeof priceHistory.$inferSelect;
