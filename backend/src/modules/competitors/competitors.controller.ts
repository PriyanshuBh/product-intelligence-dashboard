import type { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { competitorsService } from "./competitors.service";
import { generateMockPrices } from "./refresh";
import { productsService } from "../products/products.service";
import { jobsService } from "../jobs/jobs.service";
import { runJob } from "../jobs/jobs.runner";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { alertsService } from "../alerts/alerts.service";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";

type SkuParams = { sku: string };

export const competitorsController = {
  async upload(req: Request, res: Response) {
    if (!req.file) return err(res, "no_file", "No CSV file uploaded");
    const userId = req.user!.id;
    const job = await jobsService.create({
      type: "csv",
      inputRef: req.file.originalname,
      userId
    });
    runJob(job.id, req.file.buffer, async (buf, { setProgress }) => {
      await setProgress(20);
      const rows = competitorsService.parseCsv(buf);
      await setProgress(60);
      const inserted = await competitorsService.upsertMany(rows);
      await setProgress(100);
      return { result: { insertedCount: inserted.length } };
    });
    return ok(res, { jobId: job.id }, 202);
  },

  async refresh(req: Request, res: Response) {
    const userId = req.user!.id;
    const targetSku = req.body?.sku as string | undefined;
    const job = await jobsService.create({
      type: "price_refresh",
      inputRef: targetSku ?? "all",
      userId
    });
    runJob(job.id, targetSku, async (sku, { setProgress }) => {
      const rows = sku
        ? await db
            .select()
            .from(products)
            .where(and(eq(products.skuId, sku), eq(products.userId, userId)))
        : await db.select().from(products).where(eq(products.userId, userId));
      let i = 0;
      for (const p of rows) {
        if (p.price && p.price > 0) {
          const mock = generateMockPrices(p.skuId, p.price);
          await competitorsService.upsertMany(mock);
        }
        i++;
        await setProgress(Math.trunc((i / rows.length) * 100));
      }
      const ids = rows.map(r => r.skuId);
      await alertsService.regenerateForSkus(ids, userId);
      return { result: { refreshedSkus: rows.length } };
    });
    return ok(res, { jobId: job.id }, 202);
  },

  async forSku(req: Request<SkuParams>, res: Response) {
    const userId = req.user!.id;
    const product = await productsService.getOne(req.params.sku, userId);
    if (!product) return err(res, "not_found", "Product not found", 404);

    const rows = await competitorsService.forSku(req.params.sku);
    return ok(res, rows);
  },

  async historyFor(req: Request<SkuParams>, res: Response) {
    const userId = req.user!.id;
    const product = await productsService.getOne(req.params.sku, userId);
    if (!product) return err(res, "not_found", "Product not found", 404);

    const rows = await competitorsService.historyFor(req.params.sku);
    return ok(res, rows);
  },

  async manualAdd(req: Request, res: Response) {
    const userId = req.user!.id;
    const body = req.body as {
      skuId: string;
      platform: string;
      competitorUrl?: string;
      competitorPrice: number;
    };
    if (
      !body.skuId ||
      !body.platform ||
      !Number.isFinite(body.competitorPrice)
    ) {
      return err(res, "bad_input", "skuId, platform, competitorPrice required");
    }

    const product = await productsService.getOne(body.skuId, userId);
    if (!product) return err(res, "not_found", "Product not found", 404);

    const [row] = await competitorsService.upsertMany([
      {
        ...body,
        competitorPrice: Math.trunc(body.competitorPrice),
        source: "manual",
        currency: "INR"
      }
    ]);
    return ok(res, row, 201);
  }
};
