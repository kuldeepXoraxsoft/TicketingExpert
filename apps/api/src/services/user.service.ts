import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

type ListUsersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: "ADMIN" | "USER";
};

export async function listUsers(
  organizationId: string,
  userRole: "ADMIN" | "USER",
  departmentId: string | null,
  params: ListUsersParams = {}
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 25;
  const search = params.search?.trim();
  if (userRole === "USER" && !departmentId) {
    const err = new Error(
      "User is not assigned to a department"
    );
    (err as any).status = 403;
    throw err;
  }

  const where = {
    organizationId,
    ...(userRole === "USER"
      ? {
          departmentId: departmentId!,
        }
      : {}),
    ...(params.role
      ? {
          role: params.role,
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },

      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,

        department: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    }),
    prisma.user.count({
      where,
    }),
  ]);
  return {
    items,
    total,
    page,
    pageSize,
  };
}

export async function createUserInOrganization(params: {
  organizationId: string;
  actingUserId: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
  departmentId?: string;
}) {
  const existing = await prisma.user.findUnique({
    where: {
      email: params.email,
    },
  });

  if (existing) {
    const err = new Error(
      "A user with this email already exists"
    );
    (err as any).status = 409;
    throw err;
  }

  if (params.departmentId) {
    await assertDepartmentBelongsToOrg(
      params.organizationId,
      params.departmentId
    );
  }

  const passwordHash = await bcrypt.hash(
    params.password,
    10
  );

  const user = await prisma.user.create({
    data: {
      organizationId: params.organizationId,
      name: params.name,
      email: params.email,
      passwordHash,
      role: params.role,
      departmentId:
        params.role === "ADMIN"
          ? undefined
          : params.departmentId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      createdAt: true,
    },
  });



  return user;
}

export async function updateUser(params: {
  organizationId: string;
  actingUserId: string;
  userId: string;
  name?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  departmentId?: string | null;
  status?: "ACTIVE" | "DISABLED";
}) {
  const target = await prisma.user.findFirst({
    where: {
      id: params.userId,
      organizationId: params.organizationId,
    },
  });

  if (!target) {
    const err = new Error("User not found");
    (err as any).status = 404;
    throw err;
  }

  if (
    params.email &&
    params.email.toLowerCase() !==
      target.email.toLowerCase()
  ) {
    const existing = await prisma.user.findFirst({
      where: {
        email: params.email,
        id: {
          not: target.id,
        },
      },
    });

    if (existing) {
      const err = new Error(
        "A user with this email already exists"
      );
      (err as any).status = 409;
      throw err;
    }
  }
  if (params.departmentId) {
    await assertDepartmentBelongsToOrg(
      params.organizationId,
      params.departmentId
    );
  }

  const nextRole =
    params.role ?? target.role;
  const user = await prisma.user.update({
    where: {
      id: params.userId,
    },

    data: {
      ...(params.name !== undefined
        ? {
            name: params.name,
          }
        : {}),

      ...(params.email !== undefined
        ? {
            email: params.email,
          }
        : {}),

      ...(params.role !== undefined
        ? {
            role: params.role,
          }
        : {}),

      ...(params.status !== undefined
        ? {
            status: params.status,
          }
        : {}),

      ...(nextRole === "ADMIN"
        ? {
            departmentId: null,
          }
        : params.departmentId !== undefined
        ? {
            departmentId: params.departmentId,
          }
        : {}),
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,

      department: {
        select: {
          id: true,
          name: true,
        },
      },

      createdAt: true,
    },
  });

 

  return user;
}

async function assertDepartmentBelongsToOrg(
  organizationId: string,
  departmentId: string
) {
  const department =
    await prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId,
      },
    });

  if (!department) {
    const err = new Error(
      "Department not found"
    );

    (err as any).status = 404;

    throw err;
  }
}