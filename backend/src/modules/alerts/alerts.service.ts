import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { alerts, type NewAlert } from "../../db/schema/alerts";
import { products } from "../../db/schema/products";
import { competitorPrices } from "../../db/schema/competitor-prices";
import { priceHistory } from "../../db/schema/price-history";
import { buildAlerts } from "./alert-engine";
import { sendHighAlertEmail } from "../../integrations/resend";

export const alertsService = {
  async list(filters: {
    userId: string;
    severity?: "HIGH" | "MEDIUM" | "LOW";
    status?: "NEW" | "READ" | "DISMISSED";
  }) {
    const conds = [eq(alerts.userId, filters.userId)];
    if (filters.severity) conds.push(eq(alerts.severity, filters.severity));
    if (filters.status) conds.push(eq(alerts.status, filters.status));
    return db
      .select()
      .from(alerts)
      .where(and(...conds))
      .orderBy(desc(alerts.createdAt))
      .limit(200);
  },

  async dismiss(id: number, userId: string) {
    await db
      .update(alerts)
      .set({ status: "DISMISSED" })
      .where(and(eq(alerts.id, id), eq(alerts.userId, userId)));
  },

  async regenerateForSkus(skuIds: string[], userId: string) {
    if (skuIds.length === 0) return [];
    const ps = await db
      .select()
      .from(products)
      .where(and(inArray(products.skuId, skuIds), eq(products.userId, userId)));
    const cps = await db
      .select()
      .from(competitorPrices)
      .where(inArray(competitorPrices.skuId, skuIds));
    const hist = await db
      .select()
      .from(priceHistory)
      .where(inArray(priceHistory.skuId, skuIds));

    await db
      .delete(alerts)
      .where(and(inArray(alerts.skuId, skuIds), eq(alerts.userId, userId)));

    const rows: NewAlert[] = [];
    for (const p of ps) {
      const built = buildAlerts(
        p,
        hist.filter(h => h.skuId === p.skuId),
        cps.filter(c => c.skuId === p.skuId)
      );
      rows.push(...built.map(a => ({ ...a, userId })));
    }
    if (rows.length) {
      const insertedRows = await db.insert(alerts).values(rows).returning();
      const high = insertedRows.filter(r => r.severity === "HIGH");
      if (high.length) {
        await sendHighAlertEmail(
          `[PID] ${high.length} HIGH severity alerts`,
          `<ul>${high.map(a => `<li><b>${a.type}</b>: ${a.message}</li>`).join("")}</ul>`
        );
      }
      return insertedRows;
    }
    return [];
  }
};
