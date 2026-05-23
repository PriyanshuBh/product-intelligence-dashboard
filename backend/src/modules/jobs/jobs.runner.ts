import { jobsService } from "./jobs.service";
import { logger } from "../../shared/utils/logger";

export type JobHandler<TInput, TResult> = (
  input: TInput,
  ctx: { jobId: string; setProgress: (n: number) => Promise<void> }
) => Promise<{ result: TResult; partial?: boolean }>;

export function runJob<TInput, TResult>(
  jobId: string,
  input: TInput,
  handler: JobHandler<TInput, TResult>
): void {
  setImmediate(async () => {
    try {
      await jobsService.start(jobId);
      const setProgress = (n: number) => jobsService.progress(jobId, n);
      const { result, partial } = await handler(input, { jobId, setProgress });
      await jobsService.complete(jobId, result, partial);
    } catch (e) {
      logger.error({ err: e, jobId }, "job failed");
      await jobsService.fail(jobId, e instanceof Error ? e.message : String(e));
    }
  });
}
