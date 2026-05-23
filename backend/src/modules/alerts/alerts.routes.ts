import { Router } from "express";
import { alertsController } from "./alerts.controller";

const router = Router();
router.get("/", alertsController.list);
router.post("/:id/dismiss", alertsController.dismiss);
export default router;
