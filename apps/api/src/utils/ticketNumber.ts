import { prisma } from "../lib/prisma";

// Generates sequential, human-readable ticket numbers like TKT-0001024.
// Uses a row count + retry-on-conflict rather than a DB sequence so it
// stays simple across Prisma migrations; swap for a Postgres sequence
// if/when ticket volume makes the count() scan slow.
export async function generateTicketNumber(organizationId: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.ticket.count({ where: { organizationId } });
    const candidate = `TKT-${String(count + 1 + attempt).padStart(7, "0")}`;
    const exists = await prisma.ticket.findUnique({ where: { ticketNumber: candidate } });
    if (!exists) return candidate;
  }
  // Extremely unlikely fallback.
  return `TKT-${Date.now()}`;
}
