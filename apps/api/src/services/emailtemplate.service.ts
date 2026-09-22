import { prisma } from "../lib/prisma";

export interface RequestingUser {
  userId: string;
  organizationId: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  departmentId: string | null;
}

interface ListEmailTemplatesParams {
  requestedBy: RequestingUser;
  departmentId?: string;
  search?: string;
}

interface CreateEmailTemplateParams {
  requestedBy: RequestingUser;
  departmentId: string;
  title: string;
  subject?: string | null;
  body: string;
}

interface UpdateEmailTemplateParams {
  requestedBy: RequestingUser;
  templateId: string;
  departmentId?: string;
  title?: string;
  subject?: string | null;
  body?: string;
}

function isOrgAdmin(requestedBy: RequestingUser) {
  return (
    requestedBy.role === "SUPER_ADMIN" ||
    requestedBy.role === "ADMIN"
  );
}

function assertDepartmentAccess(
  requestedBy: RequestingUser,
  departmentId: string,
) {
  if (isOrgAdmin(requestedBy)) {
    return;
  }

  if (
    !requestedBy.departmentId ||
    requestedBy.departmentId !== departmentId
  ) {
    const error = new Error(
      "You do not have access to this department.",
    );

    (error as any).status = 403;

    throw error;
  }
}

async function ensureDepartmentBelongsToOrganization(
  organizationId: string,
  departmentId: string,
) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      organizationId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!department) {
    const error = new Error("Department not found.");

    (error as any).status = 404;

    throw error;
  }

  return department;
}

export async function listEmailTemplates({
  requestedBy,
  departmentId,
  search,
}: ListEmailTemplatesParams) {
  let targetDepartmentId = departmentId;

  /*
   * USER can only access their own department.
   */
  if (requestedBy.role === "USER") {
    if (!requestedBy.departmentId) {
      const error = new Error(
        "You are not assigned to a department.",
      );

      (error as any).status = 403;

      throw error;
    }

    targetDepartmentId = requestedBy.departmentId;
  }

  if (targetDepartmentId) {
    await ensureDepartmentBelongsToOrganization(
      requestedBy.organizationId,
      targetDepartmentId,
    );

    assertDepartmentAccess(
      requestedBy,
      targetDepartmentId,
    );
  }

  const normalizedSearch = search?.trim();

  const templates = await prisma.emailTemplate.findMany({
    where: {
      department: {
        organizationId: requestedBy.organizationId,
      },

      ...(targetDepartmentId
        ? {
            departmentId: targetDepartmentId,
          }
        : {}),

      ...(normalizedSearch
        ? {
            OR: [
              {
                title: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                subject: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
              {
                body: {
                  contains: normalizedSearch,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return templates;
}

export async function getEmailTemplate(
  requestedBy: RequestingUser,
  templateId: string,
) {
  const template = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
      department: {
        organizationId: requestedBy.organizationId,
      },
    },

    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!template) {
    const error = new Error("Email template not found.");

    (error as any).status = 404;

    throw error;
  }

  assertDepartmentAccess(
    requestedBy,
    template.departmentId,
  );

  return template;
}

export async function createEmailTemplate({
  requestedBy,
  departmentId,
  title,
  subject,
  body,
}: CreateEmailTemplateParams) {
  await ensureDepartmentBelongsToOrganization(
    requestedBy.organizationId,
    departmentId,
  );

  assertDepartmentAccess(
    requestedBy,
    departmentId,
  );

  const template = await prisma.emailTemplate.create({
    data: {
      title: title.trim(),
      subject: subject?.trim() || null,
      body,
      departmentId,
    },

    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return template;
}

export async function updateEmailTemplate({
  requestedBy,
  templateId,
  departmentId,
  title,
  subject,
  body,
}: UpdateEmailTemplateParams) {
  const existing = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
      department: {
        organizationId: requestedBy.organizationId,
      },
    },

    select: {
      id: true,
      departmentId: true,
    },
  });

  if (!existing) {
    const error = new Error("Email template not found.");

    (error as any).status = 404;

    throw error;
  }

  assertDepartmentAccess(
    requestedBy,
    existing.departmentId,
  );

  /*
   * If department is changed while editing,
   * validate the new department as well.
   */
  if (
    departmentId &&
    departmentId !== existing.departmentId
  ) {
    await ensureDepartmentBelongsToOrganization(
      requestedBy.organizationId,
      departmentId,
    );

    assertDepartmentAccess(
      requestedBy,
      departmentId,
    );
  }

  const template = await prisma.emailTemplate.update({
    where: {
      id: templateId,
    },

    data: {
      ...(title !== undefined
        ? {
            title: title.trim(),
          }
        : {}),

      ...(subject !== undefined
        ? {
            subject: subject?.trim() || null,
          }
        : {}),

      ...(body !== undefined
        ? {
            body,
          }
        : {}),

      ...(departmentId !== undefined
        ? {
            departmentId,
          }
        : {}),
    },

    include: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return template;
}

export async function deleteEmailTemplate(
  requestedBy: RequestingUser,
  templateId: string,
) {
  const existing = await prisma.emailTemplate.findFirst({
    where: {
      id: templateId,
      department: {
        organizationId: requestedBy.organizationId,
      },
    },

    select: {
      id: true,
      departmentId: true,
    },
  });

  if (!existing) {
    const error = new Error("Email template not found.");

    (error as any).status = 404;

    throw error;
  }

  assertDepartmentAccess(
    requestedBy,
    existing.departmentId,
  );

  await prisma.emailTemplate.delete({
    where: {
      id: templateId,
    },
  });

  return {
    message: "Email template deleted successfully.",
  };
}
