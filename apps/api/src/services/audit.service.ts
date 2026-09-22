import { prisma } from "../lib/prisma";

export async function writeAuditLog(params: {
  organizationId: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      metadata: params.metadata as any,
    },
  });
}
