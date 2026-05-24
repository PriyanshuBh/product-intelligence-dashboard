import { z } from 'zod';

export const severitySchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type Severity = z.infer<typeof severitySchema>;

export const productSchema = z.object({
  skuId: z.string().min(1).max(64),
  productTitle: z.string().nullable(),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  category: z.string().nullable(),
  price: z.number().int().nullable(),
  mrp: z.number().int().nullable(),
  imageUrl: z.string().nullable(),
  productUrl: z.string().nullable(),
  availability: z.string().nullable(),
  color: z.string().nullable(),
  size: z.string().nullable(),
  material: z.string().nullable(),
  qualityScore: z.number().int(),
});
export type Product = z.infer<typeof productSchema>;

export const issueSchema = z.object({
  id: z.number().int(),
  skuId: z.string(),
  type: z.string(),
  severity: severitySchema,
  message: z.string(),
  suggestedFix: z.string(),
  createdAt: z.string(),
});
export type Issue = z.infer<typeof issueSchema>;