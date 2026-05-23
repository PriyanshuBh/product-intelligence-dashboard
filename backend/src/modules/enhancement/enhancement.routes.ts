import { Router } from "express";
import express from "express";
import { enhancementController } from "./enhancement.controller";

const router = Router();
router.post(
  "/products/:sku/enhance-title",
  express.json(),
  enhancementController.enhance
);
export default router;
