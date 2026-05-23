import { toNodeHandler } from "better-auth/node";
import { auth } from "../../integrations/auth";
import { Router } from "express";

const authRouter = Router();

authRouter.all(/(.*)/, (req, res) => {
  return toNodeHandler(auth)(req, res);
});

export default authRouter;
