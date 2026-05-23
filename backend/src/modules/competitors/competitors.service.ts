import { eq, desc } from "drizzle-orm";
import { parse } from "csv-parse/sync";
import { db } from "../../db/client";
import {
  competitorPrices,
  type NewCompetitorPrice
} from "../../db/schema/competitor-prices";
import { priceHistory } from "../../db/schema/price-history";

export const competitorsService = {
  async upsertMany(rows: NewCompetitorPrice[]) {
    if (!rows.length) return [];
    const inserted = await db.insert(competitorPrices).values(rows).returning();
    await db.insert(priceHistory).values(
      inserted.map(r => ({
        skuId: r.skuId,
        platform: r.platform,
        price: r.competitorPrice
      }))
    );
    return inserted;
  },

  async forSku(skuId: string) {
    return db
      .select()
      .from(competitorPrices)
      .where(eq(competitorPrices.skuId, skuId))
      .orderBy(desc(competitorPrices.fetchedAt));
  },

  async historyFor(skuId: string) {
    return db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.skuId, skuId))
      .orderBy(priceHistory.recordedAt);
  },

  parseCsv(buf: Buffer): NewCompetitorPrice[] {
    const records = parse(buf, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Record<string, string>[];
    return records
      .filter(r => r.sku_id && r.platform && r.competitor_price)
      .map(r => ({
        skuId: r.sku_id.trim(),
        platform: r.platform.trim(),
        competitorUrl: r.competitor_url?.trim() || null,
        competitorPrice: Math.trunc(Number(r.competitor_price)),
        currency: r.currency?.trim() || "INR",
        source: "csv" as const
      }));
  }
};
