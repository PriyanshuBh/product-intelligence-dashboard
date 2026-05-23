import type { Request, Response } from "express";
import { jobsService } from "../jobs/jobs.service";
import { runJob } from "../jobs/jobs.runner";
import { parseProductCsv } from "./csv.service";
import { productsService } from "../products/products.service";
import { alertsService } from "../alerts/alerts.service";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";
import { eq } from "drizzle-orm";

export const csvController = {
  async uploadProducts(req: Request, res: Response) {
    if (!req.file) return err(res, "no_file", "No CSV file uploaded");
    const userId = req.user!.id;
    const buffer = req.file.buffer;
    const job = await jobsService.create({
      type: "csv",
      inputRef: req.file.originalname,
      userId
    });

    runJob(job.id, buffer, async (buf, { setProgress }) => {
      await setProgress(10);
      const parsed = parseProductCsv(buf);
      await setProgress(40);

      // Attach userId to all rows
      const rowsWithUser = parsed.rows.map(r => ({ ...r, userId }));

      const inserted = await productsService.upsertMany(rowsWithUser);
      await setProgress(70);
      const allIds = (
        await db
          .select({ s: products.skuId })
          .from(products)
          .where(eq(products.userId, userId))
      ).map(r => r.s);
      await productsService.revalidate(
        inserted.map(r => r.skuId),
        allIds
      );
      await alertsService.regenerateForSkus(
        inserted.map(r => r.skuId),
        userId
      );
      await setProgress(100);
      return {
        result: {
          insertedCount: inserted.length,
          failedRows: parsed.failedRows
        },
        partial: parsed.failedRows.length > 0
      };
    });

    return ok(res, { jobId: job.id }, 202);
  }
};
