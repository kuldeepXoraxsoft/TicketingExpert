import { Request, Response } from "express";
import { z } from "zod";

import {
  createEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplate,
  listEmailTemplates,
  updateEmailTemplate,
} from "../services/emailtemplate.service";

const createEmailTemplateSchema = z.object({
  departmentId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().max(500).nullable().optional(),
  body: z.string().min(1),
});

const updateEmailTemplateSchema = z.object({
  departmentId: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  subject: z.string().trim().max(500).nullable().optional(),
  body: z.string().min(1).optional(),
});

const listEmailTemplatesQuerySchema = z.object({
  departmentId: z.string().uuid().optional(),
  search: z.string().trim().optional(),
});

export async function listEmailTemplatesHandler(
  req: Request,
  res: Response,
) {
  const query = listEmailTemplatesQuerySchema.parse(
    req.query,
  );

  const templates = await listEmailTemplates({
    requestedBy: req.auth!,
    departmentId: query.departmentId,
    search: query.search,
  });

  res.json({
    items: templates,
    total: templates.length,
  });
}

export async function getEmailTemplateHandler(
  req: Request,
  res: Response,
) {
  const template = await getEmailTemplate(
    req.auth!,
    req.params.id,
  );

  res.json(template);
}

export async function createEmailTemplateHandler(
  req: Request,
  res: Response,
) {
  const input = createEmailTemplateSchema.parse(
    req.body,
  );

  const template = await createEmailTemplate({
    requestedBy: req.auth!,
    departmentId: input.departmentId,
    title: input.title,
    subject: input.subject,
    body: input.body,
  });

  res.status(201).json(template);
}

export async function updateEmailTemplateHandler(
  req: Request,
  res: Response,
) {
  const input = updateEmailTemplateSchema.parse(
    req.body,
  );

  const template = await updateEmailTemplate({
    requestedBy: req.auth!,
    templateId: req.params.id,
    departmentId: input.departmentId,
    title: input.title,
    subject: input.subject,
    body: input.body,
  });

  res.json(template);
}

export async function deleteEmailTemplateHandler(
  req: Request,
  res: Response,
) {
  const result = await deleteEmailTemplate(
    req.auth!,
    req.params.id,
  );

  res.json(result);
}
