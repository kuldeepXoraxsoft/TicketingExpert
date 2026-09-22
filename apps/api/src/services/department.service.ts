import { prisma } from "../lib/prisma";

export async function listDepartments(params: {
  organizationId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const page = Math.max(1, params.page ?? 1);

  const pageSize = Math.min(
    100,
    Math.max(1, params.pageSize ?? 25)
  );

  const search = params.search?.trim();

  const where = {
    organizationId: params.organizationId,

    ...(search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.department.findMany({
      where,

      orderBy: {
        name: "asc",
      },

      skip: (page - 1) * pageSize,

      take: pageSize,

      include: {
        _count: {
          select: {
            users: true,
            tickets: true,
          },
        },

        users: {
          where: {
            role: "ADMIN",
            status: "ACTIVE",
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },

          orderBy: {
            name: "asc",
          },
        },
      },
    }),

    prisma.department.count({
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

export async function createDepartment(params: {
  organizationId: string;
  actingUserId: string;
  name: string;
}) {
  const department = await prisma.department.create({
    data: {
      organizationId: params.organizationId,
      name: params.name,
    },

    include: {
      _count: {
        select: {
          users: true,
          tickets: true,
        },
      },

      users: {
        where: {
          role: "ADMIN",
          status: "ACTIVE",
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return department;
}