import { eq, desc, and } from "drizzle-orm";
import { db } from "../../db/client";
import { jobs, type Job, type NewJob } from "../../db/schema/jobs";

export const jobsService = {
  async create(
    input: Pick<NewJob, "type" | "inputRef" | "userId">
  ): Promise<Job> {
    const [row] = await db.insert(jobs).values(input).returning();
    return row;
  },

  async start(id: string) {
    await db
      .update(jobs)
      .set({ status: "RUNNING", startedAt: new Date() })
      .where(eq(jobs.id, id));
  },

  async progress(id: string, progress: number) {
    await db.update(jobs).set({ progress }).where(eq(jobs.id, id));
  },

  async complete(id: string, result: unknown, partial = false) {
    await db
      .update(jobs)
      .set({
        status: partial ? "PARTIALLY_COMPLETED" : "COMPLETED",
        progress: 100,
        resultJson: result as object,
        completedAt: new Date()
      })
      .where(eq(jobs.id, id));
  },

  async fail(id: string, error: string) {
    await db
      .update(jobs)
      .set({ status: "FAILED", error, completedAt: new Date() })
      .where(eq(jobs.id, id));
  },

  async get(id: string, userId: string): Promise<Job | null> {
    const [row] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.id, id), eq(jobs.userId, userId)));
    return row ?? null;
  },

  async list(filters: {
    userId: string;
    status?: Job["status"];
    type?: Job["type"];
    limit?: number;
  }) {
    const conds = [eq(jobs.userId, filters.userId)];
    if (filters.status) conds.push(eq(jobs.status, filters.status));
    if (filters.type) conds.push(eq(jobs.type, filters.type));
    return db
      .select()
      .from(jobs)
      .where(and(...conds))
      .orderBy(desc(jobs.createdAt))
      .limit(filters.limit ?? 50);
  }
};
