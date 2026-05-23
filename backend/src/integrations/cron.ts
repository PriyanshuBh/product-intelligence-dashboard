import cron from "node-cron";
import { logger } from "../shared/utils/logger";
import { db } from "../db/client";
import { products } from "../db/schema/products";
import { generateMockPrices } from "../modules/competitors/refresh";
import { competitorsService } from "../modules/competitors/competitors.service";
import { alertsService } from "../modules/alerts/alerts.service";

export function startCron() {
  // every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    logger.info("cron: refreshing competitor prices");
    const rows = await db.select().from(products);
    for (const p of rows) {
      if (p.price && p.price > 0) {
        const mock = generateMockPrices(p.skuId, p.price);
        await competitorsService.upsertMany(mock);
      }
    }
    const byUser = new Map<string, string[]>();
    for (const r of rows) {
      const bucket = byUser.get(r.userId) ?? [];
      bucket.push(r.skuId);
      byUser.set(r.userId, bucket);
    }
    for (const [userId, skuIds] of byUser) {
      await alertsService.regenerateForSkus(skuIds, userId);
    }
    logger.info(
      { count: rows.length, users: byUser.size },
      "cron refresh complete"
    );
  });
}
