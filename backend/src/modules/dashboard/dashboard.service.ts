import { sql, count, avg, eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { listingIssues } from "../../db/schema/issues";
import { stringify } from "csv-stringify/sync";

export const dashboardService = {
  async qualitySummary(userId: string) {
    const [{ totalProducts }] = await db
      .select({ totalProducts: count() })
      .from(products)
      .where(eq(products.userId, userId));

    const issueCounts = await db
      .select({ severity: listingIssues.severity, c: count() })
      .from(listingIssues)
      .innerJoin(products, eq(listingIssues.skuId, products.skuId))
      .where(eq(products.userId, userId))
      .groupBy(listingIssues.severity);

    const [{ avgScore }] = await db
      .select({ avgScore: avg(products.qualityScore) })
      .from(products)
      .where(eq(products.userId, userId));

    const [{ missingImageCount }] = await db
      .select({ missingImageCount: count() })
      .from(listingIssues)
      .innerJoin(products, eq(listingIssues.skuId, products.skuId))
      .where(
        and(
          eq(products.userId, userId),
          sql`${listingIssues.type} = 'missing_image'`
        )
      );

    const [{ invalidPriceCount }] = await db
      .select({ invalidPriceCount: count() })
      .from(listingIssues)
      .innerJoin(products, eq(listingIssues.skuId, products.skuId))
      .where(
        and(
          eq(products.userId, userId),
          sql`${listingIssues.type} IN ('invalid_price','mrp_lower_than_price')`
        )
      );

    const weakListings = await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(products.qualityScore)
      .limit(5);

    return {
      totalProducts,
      issueCounts: {
        HIGH: Number(issueCounts.find(r => r.severity === "HIGH")?.c ?? 0),
        MEDIUM: Number(issueCounts.find(r => r.severity === "MEDIUM")?.c ?? 0),
        LOW: Number(issueCounts.find(r => r.severity === "LOW")?.c ?? 0)
      },
      avgQualityScore: Number(avgScore ?? 0),
      missingImageCount: Number(missingImageCount),
      invalidPriceCount: Number(invalidPriceCount),
      weakListings
    };
  },

  async exportCsvReport(userId: string, skuId?: string) {
    let qProducts = db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .$dynamic();
    let qIssues = db
      .select({
        id: listingIssues.id,
        skuId: listingIssues.skuId,
        type: listingIssues.type,
        severity: listingIssues.severity,
        message: listingIssues.message
      })
      .from(listingIssues)
      .innerJoin(products, eq(listingIssues.skuId, products.skuId))
      .where(eq(products.userId, userId))
      .$dynamic();

    if (skuId) {
      qProducts = qProducts.where(eq(products.skuId, skuId));
      qIssues = qIssues.where(eq(listingIssues.skuId, skuId));
    }

    const rowsProducts = await qProducts;
    const rowsIssues = await qIssues;

    const data = rowsProducts.map(p => {
      const issues = rowsIssues.filter(i => i.skuId === p.skuId);
      return {
        SKU: p.skuId,
        Title: p.productTitle || "N/A",
        Brand: p.brand || "N/A",
        Category: p.category || "N/A",
        Price: p.price || 0,
        MRP: p.mrp || 0,
        "Quality Score": `${p.qualityScore}%`,
        "Issue Count": issues.length,
        Issues: issues.map(i => `[${i.severity}] ${i.message}`).join("; ")
      };
    });

    return stringify(data, { header: true });
  }
};
