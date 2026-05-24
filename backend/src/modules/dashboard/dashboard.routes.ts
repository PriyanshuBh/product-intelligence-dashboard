import { Router } from "express";
import { dashboardService } from "./dashboard.service";
import { ok } from "../../shared/http/ok";
import { logger } from "../../shared/utils/logger";

const router = Router();

router.get("/quality-summary", async (req, res) => {
  const userId = req.user!.id;
  const summary = await dashboardService.qualitySummary(userId);
  logger.debug(
    { userId, totalProducts: summary.totalProducts },
    "quality summary fetched"
  );
  return ok(res, summary);
});

router.get("/export-report", async (req, res) => {
  const userId = req.user!.id;
  const sku = req.query.sku as string | undefined;
  const csv = await dashboardService.exportCsvReport(userId, sku);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${sku ? `product-${sku}` : "quality-report"}.csv`
  );
  return res.send(csv);
});

export default router;
