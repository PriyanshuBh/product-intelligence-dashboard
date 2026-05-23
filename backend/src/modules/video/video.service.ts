import type { NewProduct } from "../../db/schema/products";

export type ExtractionResult = {
  product: Partial<NewProduct> & { skuId: string };
  confidence: number;
  source: "gemini" | "mock";
};

export function mockExtractFromFilename(
  filename: string,
  videoUrl: string
): ExtractionResult {
  const lower = filename.toLowerCase();
  const sku = `VID-${Date.now().toString(36).toUpperCase()}`;
  const brand =
    ["nike", "puma", "adidas", "zara", "casio", "jbl"].find(b =>
      lower.includes(b)
    ) ?? "Generic";
  const category = lower.includes("shoe")
    ? "Shoes"
    : lower.includes("dress")
      ? "Dresses"
      : lower.includes("bag")
        ? "Bags"
        : "Misc";
  return {
    product: {
      skuId: sku,
      productTitle: `${brand[0].toUpperCase()}${brand.slice(1)} ${category.slice(0, -1)}`,
      brand: brand[0].toUpperCase() + brand.slice(1),
      category,
      imageUrl: videoUrl.replace(/\.\w+$/, ".jpg"),
      availability: "in_stock"
    },
    confidence: 0.3,
    source: "mock"
  };
}

import { geminiVideoExtract, isGeminiEnabled } from "../../integrations/gemini";

export async function extractFromVideo(
  filename: string,
  videoUrl: string
): Promise<ExtractionResult> {
  if (isGeminiEnabled()) {
    const g = await geminiVideoExtract(videoUrl);
    if (g) {
      return {
        product: {
          skuId: `VID-${Date.now().toString(36).toUpperCase()}`,
          productTitle: g.title,
          brand: g.brand,
          category: g.category,
          color: g.color,
          material: g.material,
          description: g.description,
          imageUrl: videoUrl.replace(/\.\w+$/, ".jpg"),
          availability: "in_stock"
        },
        confidence: 0.8,
        source: "gemini"
      };
    }
  }
  return mockExtractFromFilename(filename, videoUrl);
}
