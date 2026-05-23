import app from "./app";
import env from "./shared/configs/env";
import { logger } from "./shared/utils/logger";
import { configureGracefulShutdown } from "./shared/utils/shutdown";

import { jobsService } from "./modules/jobs/jobs.service";
import { startCron } from "./integrations/cron";

const port = env.PORT || 9000;

startCron();

const server = app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
  logger.info(`[server]: Environment: ${env.NODE_ENV}`);
  logger.info(
    `[server]: Swagger docs are available at http://localhost:${port}/api/docs`
  );
});

configureGracefulShutdown(server);
