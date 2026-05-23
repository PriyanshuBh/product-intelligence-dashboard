import type { Product } from "../../db/schema/products";

export type RuleResult = {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  suggestedFix: string;
} | null;

export type Rule = (product: Product, skuIds: string[]) => RuleResult;

const isHttpUrl = (s: string) => /^https?:\/\/[^\s]+\.[^\s]+/.test(s);

export const missingTitle: Rule = p =>
  !p.productTitle?.trim()
    ? {
        type: "missing_title",
        severity: "HIGH",
        message: "Product is missing a title",
        suggestedFix: "Add a clear product title."
      }
    : null;

export const shortTitle: Rule = p =>
  p.productTitle &&
  p.productTitle.trim().length < 15 &&
  p.productTitle.trim().length > 0
    ? {
        type: "short_title",
        severity: "MEDIUM",
        message: "Title is too short",
        suggestedFix: "Add brand, product type, color, gender, or material."
      }
    : null;

export const missingBrand: Rule = p =>
  !p.brand?.trim()
    ? {
        type: "missing_brand",
        severity: "MEDIUM",
        message: "Brand is missing",
        suggestedFix: "Add brand if known, or mark as unbranded."
      }
    : null;

export const invalidPrice: Rule = p =>
  p.price === null ||
  p.price === undefined ||
  p.price <= 0 ||
  !Number.isFinite(p.price)
    ? {
        type: "invalid_price",
        severity: "HIGH",
        message: "Price is invalid",
        suggestedFix: "Price should be positive and numeric."
      }
    : null;

export const mrpLowerThanPrice: Rule = p =>
  p.price !== null &&
  p.mrp !== null &&
  p.price > 0 &&
  p.mrp > 0 &&
  p.mrp < p.price
    ? {
        type: "mrp_lower_than_price",
        severity: "HIGH",
        message: "MRP is lower than selling price",
        suggestedFix: "Correct MRP or selling price."
      }
    : null;

export const missingImage: Rule = p =>
  !p.imageUrl?.trim()
    ? {
        type: "missing_image",
        severity: "HIGH",
        message: "Product has no image",
        suggestedFix: "Add at least one product image."
      }
    : null;

export const brokenImageUrl: Rule = p =>
  p.imageUrl && p.imageUrl.trim() && !isHttpUrl(p.imageUrl)
    ? {
        type: "broken_image_url",
        severity: "MEDIUM",
        message: "Image URL appears invalid",
        suggestedFix: "Replace with an accessible image URL."
      }
    : null;

export const duplicateSku: Rule = (p, skuIds) =>
  skuIds.filter(s => s === p.skuId).length > 1
    ? {
        type: "duplicate_sku",
        severity: "HIGH",
        message: "Duplicate SKU detected",
        suggestedFix: "Keep SKU IDs unique."
      }
    : null;

export const weakDescription: Rule = p =>
  !p.description?.trim() || p.description.trim().length < 30
    ? {
        type: "weak_description",
        severity: "LOW",
        message: "Description is too short",
        suggestedFix: "Add more product details and attributes."
      }
    : null;

export const missingAttributes: Rule = p => {
  const present = [p.color, p.size, p.material].filter(x => x?.trim()).length;
  return present === 0
    ? {
        type: "missing_attributes",
        severity: "MEDIUM",
        message: "Important attributes (color, size, material) are missing",
        suggestedFix:
          "Add color, size, material, gender, or category-specific attributes."
      }
    : null;
};

export const outOfStock: Rule = p =>
  p.availability?.toLowerCase() === "out_of_stock"
    ? {
        type: "out_of_stock",
        severity: "LOW",
        message: "Product is out of stock",
        suggestedFix: "Mark separately or notify operations team."
      }
    : null;

export const allRules: Rule[] = [
  missingTitle,
  shortTitle,
  missingBrand,
  invalidPrice,
  mrpLowerThanPrice,
  missingImage,
  brokenImageUrl,
  duplicateSku,
  weakDescription,
  missingAttributes,
  outOfStock
];
