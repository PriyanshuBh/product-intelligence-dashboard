import type { Request, Response } from "express";
import { jobsService } from "./jobs.service";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";

export const jobsController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const status = req.query.status as "PENDING" | "RUNNING" | undefined;
    const type = req.query.type as
      | "video"
      | "csv"
      | "price_refresh"
      | undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const rows = await jobsService.list({ userId, status, type, limit });
    return ok(res, rows);
  },

  async get(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.id;
    const row = await jobsService.get(req.params.id, userId);
    if (!row) return err(res, "not_found", "Job not found", 404);
    return ok(res, row);
  }
};
