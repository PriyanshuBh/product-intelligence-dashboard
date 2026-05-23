import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uuid
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type")
    .$type<"video" | "csv" | "price_refresh" | "enhance_title">()
    .notNull(),
  status: text("status")
    .$type<
      "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIALLY_COMPLETED"
    >()
    .default("PENDING")
    .notNull(),
  progress: integer("progress").default(0).notNull(),
  inputRef: text("input_ref"),
  resultJson: jsonb("result_json"),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
