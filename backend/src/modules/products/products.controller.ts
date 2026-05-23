import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { productsService } from "./products.service";
import { alertsService } from "../alerts/alerts.service";
import { uploadImageBuffer } from "../../integrations/cloudinary";
import { db } from "../../db/client";
import { products } from "../../db/schema/products";
import { ok } from "../../shared/http/ok";
import { err } from "../../shared/http/err";

export const productsController = {
  async list(req: Request, res: Response) {
    const userId = req.user!.id;
    const rows = await productsService.list({
      userId,
      severity: req.query.severity as "HIGH" | "MEDIUM" | "LOW" | undefined,
      category: req.query.category as string | undefined,
      hasAlerts: req.query.hasAlerts === "true",
      search: req.query.q as string | undefined
    });
    return ok(res, rows);
  },

  async get(req: Request<{ sku: string }>, res: Response) {
    const userId = req.user!.id;
    const p = await productsService.getOne(req.params.sku, userId);
    if (!p) return err(res, "not_found", "Product not found", 404);
    const issues = await productsService.getIssues(p.skuId, userId);
    return ok(res, { ...p, issues });
  },

  async issues(req: Request<{ sku: string }>, res: Response) {
    const userId = req.user!.id;
    const issues = await productsService.getIssues(req.params.sku, userId);
    return ok(res, issues);
  },

  async create(req: Request, res: Response) {
    const userId = req.user!.id;
    const body = req.body;
    if (!body.skuId) return err(res, "missing_sku", "SKU is required");

    // Fetch existing product to preserve fields not sent in the request (like imageUrl)
    const existing = await productsService.getOne(body.skuId, userId);

    const productData = {
      skuId: body.skuId,
      userId,
      productTitle:
        body.productTitle !== undefined
          ? body.productTitle
          : existing?.productTitle || null,
      description:
        body.description !== undefined
          ? body.description
          : existing?.description || null,
      brand: body.brand !== undefined ? body.brand : existing?.brand || null,
      category:
        body.category !== undefined
          ? body.category
          : existing?.category || null,
      price:
        body.price !== undefined
          ? body.price
            ? Number(body.price)
            : null
          : existing?.price || null,
      mrp:
        body.mrp !== undefined
          ? body.mrp
            ? Number(body.mrp)
            : null
          : existing?.mrp || null,
      imageUrl:
        body.imageUrl !== undefined
          ? body.imageUrl
          : existing?.imageUrl || null,
      availability:
        body.availability !== undefined
          ? body.availability
          : existing?.availability || "in_stock",
      color: body.color !== undefined ? body.color : existing?.color || null,
      size: body.size !== undefined ? body.size : existing?.size || null,
      material:
        body.material !== undefined ? body.material : existing?.material || null
    };

    const inserted = await productsService.upsertMany([productData]);
    const allIds = (
      await db
        .select({ s: products.skuId })
        .from(products)
        .where(eq(products.userId, userId))
    ).map(r => r.s);
    await productsService.revalidate([productData.skuId], allIds);
    await alertsService.regenerateForSkus([productData.skuId], userId);

    return ok(res, inserted[0], 201);
  },

  async uploadImage(req: Request, res: Response) {
    if (!req.file) return err(res, "no_file", "No image file uploaded");
    const result = await uploadImageBuffer(
      req.file.buffer,
      req.file.originalname
    );
    return ok(res, { imageUrl: result.url });
  }
};
