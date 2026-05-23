import type { Product } from "../../db/schema/products";
import type { CompetitorPrice } from "../../db/schema/competitor-prices";
import type { PriceHistoryRow } from "../../db/schema/price-history";

export type BuiltAlert = {
  skuId: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  type: string;
  message: string;
  dataJson: Record<string, unknown>;
};

export function buildAlerts(
  p: Product,
  history: PriceHistoryRow[],
  competitors: CompetitorPrice[]
): BuiltAlert[] {
  const out: BuiltAlert[] = [];

  if (!p.productTitle?.trim()) {
    out.push({
      skuId: p.skuId,
      severity: "HIGH",
      type: "missing_title",
      message: `${p.skuId} has no title`,
      dataJson: {}
    });
  } else if (p.productTitle.trim().length < 15) {
    out.push({
      skuId: p.skuId,
      severity: "MEDIUM",
      type: "weak_title",
      message: `${p.skuId} has a weak title`,
      dataJson: { title: p.productTitle }
    });
  }

  if (p.price == null || p.price <= 0) {
    out.push({
      skuId: p.skuId,
      severity: "HIGH",
      type: "invalid_price",
      message: `${p.skuId} has invalid price`,
      dataJson: { price: p.price }
    });
  }

  if ([p.color, p.size, p.material].every(x => !x?.trim())) {
    out.push({
      skuId: p.skuId,
      severity: "MEDIUM",
      type: "missing_attributes",
      message: `${p.skuId} is missing key attributes`,
      dataJson: {}
    });
  }

  if (p.availability?.toLowerCase() === "out_of_stock") {
    out.push({
      skuId: p.skuId,
      severity: "LOW",
      type: "out_of_stock",
      message: `${p.skuId} is out of stock`,
      dataJson: {}
    });
  }

  if (!p.description?.trim() || p.description.trim().length < 30) {
    out.push({
      skuId: p.skuId,
      severity: "LOW",
      type: "weak_description",
      message: `${p.skuId} has a weak description`,
      dataJson: { length: p.description?.trim().length ?? 0 }
    });
  }

  if (p.price && competitors.length > 0) {
    const lowest = Math.min(...competitors.map(c => c.competitorPrice));
    const diffPct = ((p.price - lowest) / lowest) * 100;
    if (diffPct > 10) {
      out.push({
        skuId: p.skuId,
        severity: "HIGH",
        type: "overpriced_vs_competitors",
        message: `${p.skuId} priced ${diffPct.toFixed(1)}% above lowest competitor (₹${lowest})`,
        dataJson: { ourPrice: p.price, lowest, diffPct }
      });
    }
  }

  const byPlatform = new Map<string, PriceHistoryRow[]>();
  for (const h of history) {
    if (!byPlatform.has(h.platform)) byPlatform.set(h.platform, []);
    byPlatform.get(h.platform)!.push(h);
  }
  for (const [platform, hist] of byPlatform) {
    if (hist.length < 2) continue;
    const sorted = [...hist].sort((a, b) => +a.recordedAt - +b.recordedAt);
    const prev = sorted[sorted.length - 2].price;
    const latest = sorted[sorted.length - 1].price;
    const dropPct = ((prev - latest) / prev) * 100;
    if (dropPct >= 15) {
      out.push({
        skuId: p.skuId,
        severity: "MEDIUM",
        type: "competitor_price_drop",
        message: `${platform} dropped price ${dropPct.toFixed(1)}% on ${p.skuId}`,
        dataJson: { platform, previous: prev, latest, dropPct }
      });
    }
  }

  return out;
}
