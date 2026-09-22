import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth.service";
import { prisma } from "../lib/prisma";

export interface RequestAuth {
  userId: string;
  organizationId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  departmentId: string | null;
}

declare global {
  namespace Express {
    interface Request {
      auth?: RequestAuth;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const { userId } = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true, role: true, departmentId: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.auth = {
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role as "SUPER_ADMIN" | "ADMIN" | "USER",
      departmentId: user.departmentId,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Array<"SUPER_ADMIN" | "ADMIN" | "USER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
