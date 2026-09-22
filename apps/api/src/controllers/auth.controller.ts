import { Request, Response } from "express";
import { z } from "zod";
import { login, registerOrganizationWithAdmin,  changePassword, sanitizeUser } from "../services/auth.service";

const registerSchema = z.object({
  organizationName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { organization, user } = await registerOrganizationWithAdmin(input);
  res.status(201).json({ organization, user: sanitizeUser(user) });
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await login(input.email, input.password);
  res.json(result);
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changePasswordHandler(
  req: Request,
  res: Response
) {
  const input = changePasswordSchema.parse(req.body);

  const result = await changePassword({
    userId: req.auth!.userId,
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  });

  res.json(result);
}
