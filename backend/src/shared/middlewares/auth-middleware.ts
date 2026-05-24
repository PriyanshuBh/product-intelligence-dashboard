import type { Request, Response, NextFunction } from "express";
import { auth } from "../../integrations/auth";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "../utils/logger";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers)
  });

  if (!session) {
    logger.warn({ path: req.originalUrl }, "Unauthorized access attempt");
    return res.status(401).json({
      ok: false,
      error: { code: "unauthorized", message: "Unauthorized" }
    });
  }

  req.user = session.user;
  req.session = session.session;

  next();
};
