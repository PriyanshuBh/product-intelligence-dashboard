import { parse } from "csv-parse/sync";
import type { NewProduct } from "../../db/schema/products";

export type ParsedRow = Omit<NewProduct, "userId">;

export type ParseResult = {
  rows: ParsedRow[];
  failedRows: { line: number; reason: string; raw: Record<string, string> }[];
};

const REQUIRED = ["sku_id"] as const;
const toInt = (v: string | undefined): number | null => {
  if (v == null || v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};
const str = (v: string | undefined): string | null =>
  v?.trim() ? v.trim() : null;

export function parseProductCsv(buffer: Buffer): ParseResult {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Record<string, string>[];

  const rows: ParsedRow[] = [];
  const failedRows: ParseResult["failedRows"] = [];

  records.forEach((r, i) => {
    const line = i + 2;
    const missing = REQUIRED.filter(k => !r[k]?.trim());
    if (missing.length > 0) {
      failedRows.push({
        line,
        reason: `Missing required: ${missing.join(",")}`,
        raw: r
      });
      return;
    }
    rows.push({
      skuId: r.sku_id.trim(),
      productTitle: str(r.product_title),
      description: str(r.description),
      brand: str(r.brand),
      category: str(r.category),
      price: toInt(r.price),
      mrp: toInt(r.mrp),
      imageUrl: str(r.image_url),
      productUrl: str(r.product_url),
      availability: str(r.availability),
      color: str(r.color),
      size: str(r.size),
      material: str(r.material)
    });
  });

  return { rows, failedRows };
}
