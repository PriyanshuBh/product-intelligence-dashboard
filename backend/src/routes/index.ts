import { Router } from "express";
import healthRoutes from "../modules/health/health.routes";
import jobsRoutes from "../modules/jobs/jobs.routes";
import csvRoutes from "../modules/csv/csv.routes";
import productsRoutes from "../modules/products/products.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import competitorsRoutes from "../modules/competitors/competitors.routes";
import alertsRoutes from "../modules/alerts/alerts.routes";
import videoRoutes from "../modules/video/video.routes";
import enhancementRoutes from "../modules/enhancement/enhancement.routes";
import authRoutes from "../modules/auth/auth.routes";
import { setupSwagger } from "../shared/configs/swagger";
import { authMiddleware } from "../shared/middlewares/auth-middleware";

const router = Router();

// Public routes
router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
setupSwagger(router);

// Protected routes
router.use(authMiddleware);

router.use("/", csvRoutes);
router.use("/", competitorsRoutes);
router.use("/", videoRoutes);
router.use("/", enhancementRoutes);
router.use("/products", productsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/alerts", alertsRoutes);
router.use("/jobs", jobsRoutes);

export default router;
