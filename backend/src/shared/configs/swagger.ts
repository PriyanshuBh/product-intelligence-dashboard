import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const swaggerDocument = require("../../docs/swagger.json");

export const setupSwagger = (router: Router) => {
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
