import { Router } from "express";
import multer from "multer";
import express from "express";
import { competitorsController } from "./competitors.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const router = Router();

router.post(
  "/competitor-prices/upload",
  upload.single("file"),
  competitorsController.upload
);
router.post(
  "/competitor-prices/refresh",
  express.json(),
  competitorsController.refresh
);
router.post(
  "/competitor-prices",
  express.json(),
  competitorsController.manualAdd
);
router.get("/products/:sku/competitor-prices", competitorsController.forSku);
router.get("/products/:sku/price-history", competitorsController.historyFor);

export default router;
