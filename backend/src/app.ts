import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

import Routes from "./routes/index";

import { errorHandler } from "./shared/middlewares/error-handler";
import { notFoundHandler } from "./shared/middlewares/not-found-handler";
import env from "./shared/configs/env";

const app: Express = express();

app.set("trust proxy", true);

if (env.NODE_ENV === "development") {
  app.set("etag", false); // Disable 304 caching in dev
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
  })
);
app.use(helmet());
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));

//? Routes
app.get("/", (req: Request, res: Response) => {
  res.redirect("/api/health");
});

app.use("/api", Routes);

// Not found handler (should be after routes)
app.use(notFoundHandler);

// Global error handler (should be last)
app.use(errorHandler);

export default app;
