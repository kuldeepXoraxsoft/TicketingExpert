import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({ error: "Validation failed", details: err.flatten() });
  }

  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: err.message ?? "Internal server error" });
}
