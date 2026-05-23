import { Router } from "express";
import multer from "multer";
import { videoController } from "./video.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});
const router = Router();
router.post("/upload-video", upload.single("video"), videoController.upload);
export default router;
