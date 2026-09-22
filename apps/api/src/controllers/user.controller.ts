import { Request, Response } from "express";
import { z } from "zod";

import {
  createUserInOrganization,
  listUsers,
  updateUser,
} from "../services/user.service";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "USER"]),
  departmentId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  status: z.enum(["ACTIVE", "DISABLED"]).optional(),
});

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export async function listUsersHandler(
  req: Request,
  res: Response
) {
  const query = listUsersQuerySchema.parse(req.query);

  const result = await listUsers(
    req.auth!.organizationId,
    req.auth!.role,
    req.auth!.departmentId,
    query
  );

  res.json(result);
}

export async function createUserHandler(
  req: Request,
  res: Response
) {
  const input = createUserSchema.parse(req.body);

  const user = await createUserInOrganization({
    organizationId: req.auth!.organizationId,
    actingUserId: req.auth!.userId,
    ...input,
  });

  res.status(201).json(user);
}

export async function updateUserHandler(
  req: Request,
  res: Response
) {
  const input = updateUserSchema.parse(req.body);

  const user = await updateUser({
    organizationId: req.auth!.organizationId,
    actingUserId: req.auth!.userId,
    userId: req.params.id,
    ...input,
  });

  res.json(user);
}