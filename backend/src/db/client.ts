import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import env from "../shared/configs/env";

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema, casing: "snake_case" });
export type DB = typeof db;
