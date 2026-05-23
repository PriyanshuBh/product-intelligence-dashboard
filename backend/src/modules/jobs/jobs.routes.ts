import { Router } from "express";
import { jobsController } from "./jobs.controller";

const router = Router();
router.get("/", jobsController.list);
router.get("/:id", jobsController.get);
export default router;
