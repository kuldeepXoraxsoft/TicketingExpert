import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// For now this is the contract the webhook/Graph layer must fill in.
export interface IncomingEmailJob {
  organizationId: string;
  mailboxId: string;
  providerMessageId: string;
  internetMessageId: string;
  inReplyTo?: string;
  conversationId: string;
  fromEmail: string;
  fromName?: string;
  toEmails: string[];
  ccEmails: string[];
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  receivedAt: string;
  attachments?: Array<{ fileName: string; mimeType: string; size: number; contentBase64: string }>;
}

/**
 * Implements plan section 13 (email-to-ticket flow) and section 16
 * (duplicate protection). This is the ONLY place that should decide
 * "new ticket vs existing ticket" — do not duplicate this logic elsewhere.
 */
export async function processIncomingEmail(job: Job<IncomingEmailJob>) {
  const data = job.data;

  // 1. Duplicate protection (section 16): internetMessageId has a unique
  // constraint in the schema, so a duplicate delivery will fail on create
  // below. We check first to fail fast without a DB round trip on retries.
  const existingMessage = await prisma.ticketMessage.findUnique({
    where: { internetMessageId: data.internetMessageId },
  });
  if (existingMessage) {
    return { status: "skipped_duplicate", ticketId: existingMessage.ticketId };
  }

  // 2. Thread identification (section 12): try conversationId first,
  // then fall back to In-Reply-To/References matching an existing message.
  let ticket = await findTicketByConversation(data.organizationId, data.conversationId);
  if (!ticket && data.inReplyTo) {
    ticket = await findTicketByReferencedMessage(data.organizationId, data.inReplyTo);
  }

  if (ticket) {
    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        providerMessageId: data.providerMessageId,
        internetMessageId: data.internetMessageId,
        conversationId: data.conversationId,
        direction: "INBOUND",
        source: "EMAIL",
        senderType: "CUSTOMER",
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        toEmails: data.toEmails,
        ccEmails: data.ccEmails,
        subject: data.subject,
        bodyText: data.bodyText,
        bodyHtml: data.bodyHtml,
        sentAt: new Date(data.receivedAt),
      },
    });

    // Customer replied -> ticket goes back to OPEN (plan section 25).
    await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "OPEN" } });

    // TODO: process data.attachments -> Azure Blob Storage (Phase 4/section 23)
    // TODO: notify assigned agent/team via WebSocket (section 28)
    // TODO: write audit log entry (section 29)

    return { status: "appended_to_existing_ticket", ticketId: ticket.id, messageId: message.id };
  }

  // 3. No matching ticket found -> create a new one.
  const ticketNumber = await generateTicketNumberForWorker(data.organizationId);
  const created = await prisma.ticket.create({
    data: {
      ticketNumber,
      organizationId: data.organizationId,
      mailboxId: data.mailboxId,
      subject: data.subject,
      requesterEmail: data.fromEmail,
      requesterName: data.fromName,
      status: " OPEN",
      priority: "MEDIUM",
      source: "EMAIL",
      messages: {
        create: {
          providerMessageId: data.providerMessageId,
          internetMessageId: data.internetMessageId,
          conversationId: data.conversationId,
          direction: "INBOUND",
          source: "EMAIL",
          senderType: "CUSTOMER",
          fromEmail: data.fromEmail,
          fromName: data.fromName,
          toEmails: data.toEmails,
          ccEmails: data.ccEmails,
          subject: data.subject,
          bodyText: data.bodyText,
          bodyHtml: data.bodyHtml,
          sentAt: new Date(data.receivedAt),
        },
      },
    },
    include: { messages: true },
  });

  // TODO: process attachments, notify unassigned queue, audit log (same as above)

  return { status: "created_new_ticket", ticketId: created.id, ticketNumber: created.ticketNumber };
}

async function findTicketByConversation(organizationId: string, conversationId: string) {
  if (!conversationId) return null;
  const message = await prisma.ticketMessage.findFirst({
    where: { conversationId, ticket: { organizationId } },
    orderBy: { createdAt: "desc" },
  });
  if (!message) return null;
  return prisma.ticket.findUnique({ where: { id: message.ticketId } });
}

async function findTicketByReferencedMessage(organizationId: string, inReplyTo: string) {
  const message = await prisma.ticketMessage.findFirst({
    where: { internetMessageId: inReplyTo, ticket: { organizationId } },
  });
  if (!message) return null;
  return prisma.ticket.findUnique({ where: { id: message.ticketId } });
}

async function generateTicketNumberForWorker(organizationId: string): Promise<string> {
  const count = await prisma.ticket.count({ where: { organizationId } });
  return `TKT-${String(count + 1).padStart(7, "0")}`;
}
