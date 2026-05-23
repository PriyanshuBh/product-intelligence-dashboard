const KEYWORDS: Record<string, string[]> = {
  Shoes: ["lightweight", "running", "sports", "comfortable", "breathable"],
  Dresses: ["summer", "casual", "partywear", "lightweight", "cotton"],
  Watches: ["analog", "water-resistant", "classic", "stainless-steel"],
  Audio: ["wireless", "bluetooth", "noise-cancelling", "deep-bass"],
  Bags: ["waterproof", "travel", "spacious", "durable"],
  Misc: ["trending", "best-selling", "popular"]
};

export function keywordsFor(category: string | null): string[] {
  if (!category) return KEYWORDS.Misc;
  return KEYWORDS[category] ?? KEYWORDS.Misc;
}
