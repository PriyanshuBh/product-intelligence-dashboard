import { eq, inArray, sql, and } from "drizzle-orm";
import { db } from "../../db/client";
import { products, type NewProduct } from "../../db/schema/products";
import { listingIssues } from "../../db/schema/issues";
import { runAllRules } from "../validation/validate";
import { computeQualityScore } from "../validation/quality-score";

export const productsService = {
  async upsertMany(rows: NewProduct[]) {
    if (rows.length === 0) return [];
    return db
      .insert(products)
      .values(rows)
      .onConflictDoUpdate({
        target: products.skuId,
        set: {
          userId: sql`excluded.user_id`,
          productTitle: sql`excluded.product_title`,
          description: sql`excluded.description`,
          brand: sql`excluded.brand`,
          category: sql`excluded.category`,
          price: sql`excluded.price`,
          mrp: sql`excluded.mrp`,
          imageUrl: sql`excluded.image_url`,
          productUrl: sql`excluded.product_url`,
          availability: sql`excluded.availability`,
          color: sql`excluded.color`,
          size: sql`excluded.size`,
          material: sql`excluded.material`,
          updatedAt: new Date()
        }
      })
      .returning();
  },

  async revalidate(skuIdsToCheck: string[], allSkuIds: string[]) {
    if (skuIdsToCheck.length === 0) return;
    const rows = await db
      .select()
      .from(products)
      .where(inArray(products.skuId, skuIdsToCheck));
    await db
      .delete(listingIssues)
      .where(inArray(listingIssues.skuId, skuIdsToCheck));
    for (const p of rows) {
      const issues = runAllRules(p, allSkuIds);
      if (issues.length > 0) {
        await db
          .insert(listingIssues)
          .values(issues.map(i => ({ ...i, skuId: p.skuId })));
      }
      const score = computeQualityScore(issues);
      await db
        .update(products)
        .set({ qualityScore: score })
        .where(eq(products.skuId, p.skuId));
    }
  },

  async list(filters: {
    userId: string;
    severity?: "HIGH" | "MEDIUM" | "LOW";
    category?: string;
    hasAlerts?: boolean;
    search?: string;
  }) {
    let q = db
      .select()
      .from(products)
      .where(eq(products.userId, filters.userId))
      .$dynamic();
    if (filters.category) q = q.where(eq(products.category, filters.category));
    if (filters.search) {
      q = q.where(
        sql`${products.productTitle} ILIKE ${"%" + filters.search + "%"}`
      );
    }
    return q.orderBy(products.skuId);
  },

  async getOne(skuId: string, userId: string) {
    const [p] = await db
      .select()
      .from(products)
      .where(and(eq(products.skuId, skuId), eq(products.userId, userId)));
    return p ?? null;
  },

  async getIssues(skuId: string, userId: string) {
    return db
      .select({
        id: listingIssues.id,
        skuId: listingIssues.skuId,
        type: listingIssues.type,
        severity: listingIssues.severity,
        message: listingIssues.message,
        suggestedFix: listingIssues.suggestedFix,
        createdAt: listingIssues.createdAt
      })
      .from(listingIssues)
      .innerJoin(products, eq(listingIssues.skuId, products.skuId))
      .where(and(eq(listingIssues.skuId, skuId), eq(products.userId, userId)));
  }
};
