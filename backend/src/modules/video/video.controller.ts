import type { Request, Response } from "express";
import { uploadVideoBuffer } from "../../integrations/cloudinary";
import { jobsService } from "../jobs/jobs.service";
import { runJob } from "../jobs/jobs.runner";
import { productsService } from "../products/products.service";
import { alertsService } from "../alerts/alerts.service";
import { enhancementService } from "../enhancement/enhancement.service";
import { mockExtractFromFilename, extractFromVideo } from "./video.service";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";
import { eq } from "drizzle-orm";

export const videoController = {
  async upload(req: Request, res: Response) {
    if (!req.file) return err(res, "no_file", "No video file uploaded");
    const userId = req.user!.id;
    const enhanceTitle = String(req.body?.enhanceTitle ?? "false") === "true";
    const filename = req.file.originalname;
    const job = await jobsService.create({
      type: "video",
      inputRef: filename,
      userId
    });

    runJob(
      job.id,
      { buffer: req.file.buffer, filename, enhanceTitle, userId },
      async (input, { setProgress }) => {
        await setProgress(15);
        const upload = await uploadVideoBuffer(input.buffer, input.filename);
        await setProgress(50);
        const extraction = await extractFromVideo(input.filename, upload.url);
        await setProgress(75);

        const productWithUser = { ...extraction.product, userId };
        const [row] = await productsService.upsertMany([productWithUser]);
        const allIds = (
          await db
            .select({ s: products.skuId })
            .from(products)
            .where(eq(products.userId, userId))
        ).map(r => r.s);

        let enhanced = null;
        if (input.enhanceTitle) {
          enhanced = await enhancementService.enhance(row.skuId, input.userId);
        }

        await productsService.revalidate([row.skuId], allIds);
        await alertsService.regenerateForSkus([row.skuId], userId);
        await setProgress(100);

        return {
          result: {
            videoUrl: upload.url,
            extraction,
            enhanced,
            skuId: row.skuId
          }
        };
      }
    );

    return ok(res, { jobId: job.id }, 202);
  }
};
