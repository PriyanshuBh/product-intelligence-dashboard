import type { Request, Response } from "express";
import { enhancementService } from "./enhancement.service";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";

export const enhancementController = {
  async enhance(req: Request<{ sku: string }>, res: Response) {
    try {
      const userId = req.user!.id;
      const r = await enhancementService.enhance(req.params.sku, userId);
      return ok(res, r);
    } catch (e) {
      return err(
        res,
        "enhance_failed",
        e instanceof Error ? e.message : "failed",
        500
      );
    }
  }
};
