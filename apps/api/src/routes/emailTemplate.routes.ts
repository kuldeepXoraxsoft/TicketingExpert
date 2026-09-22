import { Router } from "express";

import {
  createEmailTemplateHandler,
  deleteEmailTemplateHandler,
  getEmailTemplateHandler,
  listEmailTemplatesHandler,
  updateEmailTemplateHandler,
} from "../controllers/emailtemplate.controller";

import { requireAuth } from "../middleware/auth";

export const emailTemplateRouter = Router();
emailTemplateRouter.use(requireAuth);

emailTemplateRouter.get("/", listEmailTemplatesHandler);
emailTemplateRouter.get("/:id", getEmailTemplateHandler);
emailTemplateRouter.post("/", createEmailTemplateHandler);
emailTemplateRouter.patch("/:id", updateEmailTemplateHandler);
emailTemplateRouter.delete("/:id", deleteEmailTemplateHandler);

