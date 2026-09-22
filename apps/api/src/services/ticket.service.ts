import { prisma } from "../lib/prisma";
import { generateTicketNumber } from "../utils/ticketNumber";

export interface RequestingUser {
  userId: string;
  organizationId: string;
  role: "ADMIN" | "USER";
  departmentId: string | null;
}

export interface CreateTicketInput {
  requestedBy: RequestingUser;

  subject: string;

  requesterEmail: string;

  requesterName?: string;

  departmentId?: string;

  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

  source?: "EMAIL" | "MANUAL" | "API";

  firstMessage?: {
    bodyText?: string;
    bodyHtml?: string;

    fromEmail: string;
    fromName?: string;

    direction: "INBOUND" | "OUTBOUND";

    senderType: "CUSTOMER" | "AGENT" | "SYSTEM";

    source: "EMAIL" | "PLATFORM" | "SYSTEM";

    internetMessageId?: string;

    conversationId?: string;
  };
}

export async function createTicket(input: CreateTicketInput) {
  const { requestedBy } = input;

  const departmentId =
    requestedBy.role === "USER"
      ? requestedBy.departmentId ?? undefined
      : input.departmentId;

  const ticketNumber = await generateTicketNumber(
    requestedBy.organizationId
  );

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber,

      organizationId: requestedBy.organizationId,

      departmentId,

      subject: input.subject,

      requesterEmail: input.requesterEmail,

      requesterName: input.requesterName,

      priority: input.priority ?? "MEDIUM",

      source: input.source ?? "MANUAL",

      // IMPORTANT:
      // Your supported ticket statuses start from OPEN.
      status: "OPEN",

      messages: input.firstMessage
        ? {
            create: {
              bodyText: input.firstMessage.bodyText,

              bodyHtml: input.firstMessage.bodyHtml,

              fromEmail: input.firstMessage.fromEmail,

              fromName: input.firstMessage.fromName,

              toEmails: [],

              ccEmails: [],

              direction: input.firstMessage.direction,

              senderType: input.firstMessage.senderType,

              source: input.firstMessage.source,

              internetMessageId:
                input.firstMessage.internetMessageId,

              conversationId:
                input.firstMessage.conversationId,

              sentAt: new Date(),
            },
          }
        : undefined,
    },

    include: {
      messages: true,
    },
  });

 

  return ticket;
}

export async function listTickets(params: {
  requestedBy: RequestingUser;

  status?: string;

  assignedToId?: string;

  departmentId?: string;

  search?: string;

  page?: number;

  pageSize?: number;

  direction?: string;
}) {
  const { requestedBy } = params;

  const page = Math.max(1, params.page ?? 1);

  const pageSize = Math.min(
    100,
    Math.max(1, params.pageSize ?? 25)
  );

  const departmentFilter =
    requestedBy.role === "USER"
      ? requestedBy.departmentId ?? "__none__"
      : params.departmentId;

  const search = params.search?.trim();

  const where = {
    organizationId: requestedBy.organizationId,

    ...(departmentFilter
      ? {
          departmentId: departmentFilter,
        }
      : {}),

    ...(params.status
      ? {
          status: params.status as any,
        }
      : {}),

    ...(params.assignedToId
      ? {
          assignedToId: params.assignedToId,
        }
      : {}),
      ...(params.direction 
       ? {
         direction: params.direction,
       } : {}
      ),

    ...(search
      ? {
          OR: [
            {
              ticketNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              requesterEmail: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.ticket.findMany({
      where,

      orderBy: {
        updatedAt: "desc",
      },

      skip: (page - 1) * pageSize,

      take: pageSize,

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.ticket.count({
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

export async function getTicketWithTimeline(
  requestedBy: RequestingUser,
  ticketId: string
) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,

      organizationId: requestedBy.organizationId,
    },

    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },

        include: {
          attachments: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    (err as any).status = 404;
    throw err;
  }

  assertDepartmentAccess(
    requestedBy,
    ticket.departmentId
  );

  return ticket;
}

export async function addTicketMessage(params: {
  requestedBy: RequestingUser;
  ticketId: string;
  bodyText?: string;
  bodyHtml?: string;
  isInternal: boolean;
  fromEmail: string;
  fromName?: string;
  toEmails?: string[];
  ccEmails?: string[];
  direction: "INBOUND" | "OUTBOUND";
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  source: "EMAIL" | "PLATFORM" | "SYSTEM";
  internetMessageId?: string;
  conversationId?: string;
}) {
  const { requestedBy } = params;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.ticketId,

      organizationId: requestedBy.organizationId,
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");
    (err as any).status = 404;
    throw err;
  }

  assertDepartmentAccess(
    requestedBy,
    ticket.departmentId
  );

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: params.ticketId,
      authorId: requestedBy.userId,
      bodyText: params.bodyText,
      bodyHtml: params.bodyHtml,
      isInternal: params.isInternal,
      fromEmail: params.fromEmail,
      fromName: params.fromName,
      toEmails: params.toEmails ?? [],
      ccEmails: params.ccEmails ?? [],
      direction: params.direction,
      senderType: params.senderType,
      source: params.source,
      internetMessageId:
        params.internetMessageId,
      conversationId:
        params.conversationId,
      sentAt: new Date(),
    },
  });

  if (!params.isInternal) {
    const nextStatus =
      params.direction === "INBOUND"
        ? "OPEN"
        : params.direction === "OUTBOUND"
        ? "AWAITING"
        : undefined;

    if (nextStatus) {
      await prisma.ticket.update({
        where: {
          id: params.ticketId,
        },

        data: {
          status: nextStatus as any,

          firstResponseAt:
            nextStatus === "AWAITING" &&
            !ticket.firstResponseAt
              ? new Date()
              : undefined,
        },
      });
    }
  }



  return message;
}

export async function updateTicketStatusOrAssignment(params: {
  requestedBy: RequestingUser;

  ticketId: string;

  status?:
    | "OPEN"
    | "ON_HOLD"
    | "FOLLOWING_UP"
    | "IN_PROGRESS"
    | "ANSWERED"
    | "AWAITING"
    | "RESOLVED"
    | "CLOSED";

  priority?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL";

  assignedToId?: string | null;

  departmentId?: string | null;
}) {
  const { requestedBy } = params;

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.ticketId,

      organizationId: requestedBy.organizationId,
    },
  });

  if (!ticket) {
    const err = new Error("Ticket not found");

    (err as any).status = 404;

    throw err;
  }

  assertDepartmentAccess(
    requestedBy,
    ticket.departmentId
  );

  const departmentId =
    requestedBy.role === "ADMIN"
      ? params.departmentId
      : undefined;

  const updated = await prisma.ticket.update({
    where: {
      id: params.ticketId,
    },

    data: {
      status: params.status,

      priority: params.priority,

      assignedToId: params.assignedToId,

      departmentId:
        requestedBy.role === "ADMIN" &&
        params.departmentId !== undefined
          ? departmentId
          : undefined,

      resolvedAt:
        params.status === "RESOLVED"
          ? new Date()
          : undefined,

      closedAt:
        params.status === "CLOSED"
          ? new Date()
          : undefined,
    },
  });

 

  return updated;
}

function assertDepartmentAccess(
  requestedBy: RequestingUser,
  ticketDepartmentId: string | null
) {
  if (requestedBy.role === "ADMIN") return;

  if (
    !requestedBy.departmentId ||
    ticketDepartmentId !== requestedBy.departmentId
  ) {
    const err = new Error("Ticket not found");

    (err as any).status = 404;

    throw err;
  }
}