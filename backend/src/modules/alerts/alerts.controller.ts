import type { Request, Response } from "express";
import { alertsService } from "./alerts.service";
import { ok } from "../../shared/http/ok";

export const alertsController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const rows = await alertsService.list({
      userId,
      severity: req.query.severity as "HIGH" | "MEDIUM" | "LOW" | undefined,
      status: req.query.status as "NEW" | "READ" | "DISMISSED" | undefined
    });
    return ok(res, rows);
  },

  async dismiss(req: Request, res: Response) {
    const userId = req.user!.id;
    await alertsService.dismiss(Number(req.params.id), userId);
    return ok(res, { dismissed: true });
  }
};
