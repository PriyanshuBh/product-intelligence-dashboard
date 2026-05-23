import type { Response } from "express";

export function err(
  res: Response,
  code: string,
  message: string,
  status = 400
) {
  return res.status(status).json({ ok: false, error: { code, message } });
}
