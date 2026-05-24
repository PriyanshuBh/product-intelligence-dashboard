import { z } from 'zod';
import { severitySchema } from './product';

export const alertTypeSchema = z.enum([
  'missing_title',
  'missing_price',
  'invalid_price',
  'overpriced_vs_competitors',
  'weak_title',
  'missing_attributes',
  'competitor_price_drop',
  'weak_description',
  'out_of_stock',
]);
export type AlertType = z.infer<typeof alertTypeSchema>;

export const alertSchema = z.object({
  id: z.number().int(),
  skuId: z.string().nullable(),
  severity: severitySchema,
  type: alertTypeSchema,
  message: z.string(),
  dataJson: z.unknown().nullable(),
  status: z.enum(['NEW', 'READ', 'DISMISSED']),
  createdAt: z.string(),
});
export type Alert = z.infer<typeof alertSchema>;