import { Request, Response } from "express";
import { z } from "zod";

import {
  createDepartment,
  listDepartments,
} from "../services/department.service";

const createDepartmentSchema = z.object({
  name: z.string().trim().min(1),
});

const listDepartmentsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(25),

  search: z
    .string()
    .trim()
    .optional(),
});

export async function listDepartmentsHandler(
  req: Request,
  res: Response
) {
  const query =
    listDepartmentsQuerySchema.parse(
      req.query
    );

  const result = await listDepartments({
    organizationId:
      req.auth!.organizationId,

    search: query.search,

    page: query.page,

    pageSize: query.pageSize,
  });

  res.json(result);
}

export async function createDepartmentHandler(
  req: Request,
  res: Response
) {
  const input =
    createDepartmentSchema.parse(req.body);

  const department =
    await createDepartment({
      organizationId:
        req.auth!.organizationId,

      actingUserId: req.auth!.userId,

      name: input.name,
    });

  res.status(201).json(department);
}