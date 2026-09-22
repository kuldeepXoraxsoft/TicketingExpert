import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

export interface AuthTokenPayload {
  userId: string;
}

export class AuthError extends Error {
  status = 401;
}

export async function registerOrganizationWithAdmin(input: {
  organizationName: string;
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err = new Error("A user with this email already exists");
    (err as any).status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: input.organizationName },
    });

    const user = await tx.user.create({
      data: {
        organizationId: organization.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: "ADMIN",
      },
    });

    return { organization, user };
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!user || user.status !== "ACTIVE") {
    throw new AuthError("Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthError("Invalid email or password");
  }

  const token = issueToken({ userId: user.id });

  return { token, user: sanitizeUser(user) };
}

export function issueToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as any });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

export function sanitizeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function changePassword(params: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    select: {
      id: true,
      passwordHash: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    const err = new Error("User not found");
    (err as any).status = 404;
    throw err;
  }

  const currentPasswordValid = await bcrypt.compare(
    params.currentPassword,
    user.passwordHash
  );

  if (!currentPasswordValid) {
    const err = new Error("Current password is incorrect");
    (err as any).status = 400;
    throw err;
  }

  const samePassword = await bcrypt.compare(
    params.newPassword,
    user.passwordHash
  );

  if (samePassword) {
    const err = new Error(
      "New password must be different from current password"
    );

    (err as any).status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(
    params.newPassword,
    10
  );

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
    },
  });

  return {
    message: "Password changed successfully",
  };
}