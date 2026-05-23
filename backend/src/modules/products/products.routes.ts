import { Router } from "express";
import express from "express";
import multer from "multer";
import { productsController } from "./products.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
const router = Router();
router.get("/", productsController.list);
router.post("/", express.json(), productsController.create);
router.post(
  "/upload-image",
  upload.single("image"),
  productsController.uploadImage
);
router.get("/:sku", productsController.get);
router.get("/:sku/issues", productsController.issues);
export default router;
