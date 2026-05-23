import { eq, and } from "drizzle-orm";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { titleEnhancements } from "../../db/schema/title-enhancements";
import { geminiJson, isGeminiEnabled } from "../../integrations/gemini";
import { keywordsFor } from "./keywords";

export type EnhancementResult = {
  originalTitle: string;
  attributes: Record<string, string>;
  keywords: string[];
  enhancedTitle: string;
  reason: string;
  source: "gemini" | "mock";
};

function mockEnhance(
  p: {
    productTitle: string | null;
    brand: string | null;
    color: string | null;
    material: string | null;
    category: string | null;
  },
  keywords: string[]
): EnhancementResult {
  const attrs: Record<string, string> = {
    Brand: p.brand || "Generic",
    Color: p.color || "Multi",
    "Product type": p.category ? p.category.slice(0, -1) : "Product",
    Gender: "Unisex",
    Material: p.material || "Synthetic"
  };

  const parts = [
    attrs.Brand,
    attrs.Color,
    keywords[0] || "Quality",
    attrs["Product type"],
    `with ${attrs.Material} Finish`
  ]
    .filter(Boolean)
    .join(" ");

  return {
    originalTitle: p.productTitle ?? "Untitled",
    attributes: attrs,
    keywords: keywords.length ? keywords : ["trending", "ecommerce"],
    enhancedTitle: parts,
    reason:
      "Simulated AI enhancement using extracted attributes and trending keywords (Gemini Offline Fallback).",
    source: "mock"
  };
}

export const enhancementService = {
  async enhance(skuId: string, userId: string): Promise<EnhancementResult> {
    const [p] = await db
      .select()
      .from(products)
      .where(and(eq(products.skuId, skuId), eq(products.userId, userId)));
    if (!p) throw new Error("Product not found");
    const keywords = keywordsFor(p.category);

    let result: EnhancementResult | null = null;
    if (isGeminiEnabled()) {
      const g = await geminiJson<EnhancementResult>(
        `Improve this product title for e-commerce SEO. 
Extract attributes like Brand, Color, Product type, Gender, and Material from the data.
Generate relevant search keywords.
Create an Enhanced Title combining these elements (e.g. "Nike Blue Lightweight Running Shoes for Men with Mesh Upper").

Original title: ${p.productTitle || "None"}
Brand: ${p.brand || "None"}
Color: ${p.color || "None"}
Material: ${p.material || "None"}
Category: ${p.category || "None"}
Trending keywords: ${keywords.join(", ")}`,
        '{originalTitle:string,attributes:{"Brand":string,"Color":string,"Product type":string,"Gender":string,"Material":string},keywords:string[],enhancedTitle:string,reason:string}'
      );
      if (g) result = { ...g, source: "gemini" };
    }
    if (!result) result = mockEnhance(p, keywords);

    await db.insert(titleEnhancements).values({
      skuId,
      originalTitle: result.originalTitle,
      attributesJson: result.attributes,
      keywordsJson: result.keywords,
      enhancedTitle: result.enhancedTitle,
      reason: result.reason
    });

    return result;
  }
};
