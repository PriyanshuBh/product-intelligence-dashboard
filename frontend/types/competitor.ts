import { z } from 'zod';

export const platformSchema = z.enum([
  'Amazon',
  'Myntra',
  'Ajio',
  'Nykaa Fashion',
  'Tata Cliq',
  'Meesho',
]);
export type Platform = z.infer<typeof platformSchema>;

export const competitorPriceSchema = z.object({
  id: z.number().int(),
  skuId: z.string(),
  platform: z.string(),
  competitorUrl: z.string().nullable(),
  competitorPrice: z.number().int(),
  currency: z.string(),
  source: z.enum(['mock', 'csv', 'manual']),
  fetchedAt: z.string(),
});
export type CompetitorPrice = z.infer<typeof competitorPriceSchema>;