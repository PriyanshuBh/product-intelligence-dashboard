import type { NewCompetitorPrice } from "../../db/schema/competitor-prices";

const PLATFORMS = [
  "Amazon",
  "Myntra",
  "Ajio",
  "Nykaa Fashion",
  "Tata Cliq",
  "Meesho"
];

export function fluctuatePrice(basePrice: number, seed: number): number {
  const swing =
    (Math.sin(seed) * 0.15 + Math.cos(seed * 1.3) * 0.05) * basePrice;
  return Math.max(1, Math.trunc(basePrice + swing));
}

export function generateMockPrices(
  skuId: string,
  basePrice: number,
  seedOffset = Date.now()
): NewCompetitorPrice[] {
  return PLATFORMS.map((platform, i) => ({
    skuId,
    platform,
    competitorUrl: `https://example.com/${platform.toLowerCase().replace(" ", "-")}/${skuId}`,
    competitorPrice: fluctuatePrice(basePrice, seedOffset + i * 7),
    currency: "INR",
    source: "mock" as const
  }));
}
