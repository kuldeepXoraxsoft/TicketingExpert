import { Request, Response } from "express";
import { z } from "zod";
import {
  addTicketMessage,
  createTicket,
  getTicketWithTimeline,
  listTickets,
  updateTicketStatusOrAssignment,
} from "../services/ticket.service";

const createTicketSchema = z.object({
  subject: z.string().min(1),
  requesterEmail: z.string().email(),
  requesterName: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  bodyText: z.string().optional(),
});

const addMessageSchema = z.object({
  bodyText: z.string().min(1),
  isInternal: z.boolean().default(false),
});

const updateTicketSchema = z.object({
  status: z
    .enum([
      "OPEN",
      "ON_HOLD",
      "FOLLOWING_UP",
      "IN_PROGRESS",
      "ANSWERED",
      "AWAITING",
      "RESOLVED",
      "CLOSED",
    ])
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

  assignedToId: z.string().uuid().nullable().optional(),

  departmentId: z.string().uuid().nullable().optional(),
});

const listTicketsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  pageSize: z.coerce.number().int().min(1).max(100).default(25),

  status: z
    .enum([
      "OPEN",
      "ON_HOLD",
      "FOLLOWING_UP",
      "IN_PROGRESS",
      "ANSWERED",
      "AWAITING",
      "RESOLVED",
      "CLOSED",
    ])
    .optional(),

  assignedToId: z.string().uuid().optional(),

  departmentId: z.string().uuid().optional(),

  search: z.string().trim().optional(),
});

export async function listTicketsHandler(req: Request, res: Response) {
  const query = listTicketsQuerySchema.parse(req.query);

  const result = await listTickets({
    requestedBy: req.auth!,

    status: query.status,

    assignedToId: query.assignedToId,

    departmentId: query.departmentId,

    search: query.search,

    page: query.page,

    pageSize: query.pageSize,
  });

  res.json(result);
}

export async function createTicketHandler(req: Request, res: Response) {
  const input = createTicketSchema.parse(req.body);

  const ticket = await createTicket({
    requestedBy: req.auth!,

    subject: input.subject,

    requesterEmail: input.requesterEmail,

    requesterName: input.requesterName,

    departmentId: input.departmentId,

    priority: input.priority,

    source: "MANUAL",

    firstMessage: input.bodyText
      ? {
          bodyText: input.bodyText,
          fromEmail: input.requesterEmail,
          fromName: input.requesterName,
          direction: "INBOUND",
          senderType: "CUSTOMER",
          source: "PLATFORM",
        }
      : undefined,
  });

  res.status(201).json(ticket);
}

export async function getTicketHandler(req: Request, res: Response) {
  const ticket = await getTicketWithTimeline(
    req.auth!,
    req.params.id
  );

  res.json(ticket);
}

export async function addMessageHandler(req: Request, res: Response) {
  const input = addMessageSchema.parse(req.body);

  const message = await addTicketMessage({
    requestedBy: req.auth!,

    ticketId: req.params.id,

    bodyText: input.bodyText,

    isInternal: input.isInternal,

    fromEmail: "agent@platform.local",

    direction: "OUTBOUND",

    senderType: "AGENT",

    source: "PLATFORM",
  });

  res.status(201).json(message);
}

export async function updateTicketHandler(req: Request, res: Response) {
  const input = updateTicketSchema.parse(req.body);

  const ticket = await updateTicketStatusOrAssignment({
    requestedBy: req.auth!,

    ticketId: req.params.id,

    ...input,
  });

  res.json(ticket);
}