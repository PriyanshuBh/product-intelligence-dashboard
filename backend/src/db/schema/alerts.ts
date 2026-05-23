import {
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  jsonb
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { user } from "./auth";

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  skuId: varchar("sku_id", { length: 64 }).references(() => products.skuId, {
    onDelete: "cascade"
  }),
  severity: text("severity").$type<"HIGH" | "MEDIUM" | "LOW">().notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  dataJson: jsonb("data_json"),
  status: text("status")
    .$type<"NEW" | "READ" | "DISMISSED">()
    .default("NEW")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
