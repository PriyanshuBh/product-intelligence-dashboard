import { z } from 'zod';

export const jobStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'PARTIALLY_COMPLETED',
]);
export type JobStatus = z.infer<typeof jobStatusSchema>;

export const jobTypeSchema = z.enum(['video', 'csv', 'price_refresh', 'enhance_title']);
export type JobType = z.infer<typeof jobTypeSchema>;

export const jobSchema = z.object({
  id: z.string().uuid(),
  type: jobTypeSchema,
  status: jobStatusSchema,
  progress: z.number().int().min(0).max(100),
  inputRef: z.string().nullable(),
  resultJson: z.unknown().nullable(),
  error: z.string().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type Job = z.infer<typeof jobSchema>;