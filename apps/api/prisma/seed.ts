import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Edit these before running, or leave as-is for a quick test login.
const SEED = {
  organizationName: "Acme",
  adminName: "Kuldeep",
  adminEmail: "admin@acme.com",
  adminPassword: "password123",
  departmentName: "IT Support",
  deptUserName: "Rahul",
  deptUserEmail: "rahul@acme.com",
  deptUserPassword: "password123",
};

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: SEED.adminEmail } });
  if (existing) {
    console.log(`User ${SEED.adminEmail} already exists — skipping seed.`);
    return;
  }

  const organization = await prisma.organization.create({
    data: { name: SEED.organizationName },
  });

  const admin = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: SEED.adminName,
      email: SEED.adminEmail,
      passwordHash: await bcrypt.hash(SEED.adminPassword, 10),
      role: "ADMIN",
    },
  });

  const department = await prisma.department.create({
    data: { organizationId: organization.id, name: SEED.departmentName },
  });

  const deptUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: SEED.deptUserName,
      email: SEED.deptUserEmail,
      passwordHash: await bcrypt.hash(SEED.deptUserPassword, 10),
      role: "USER",
      departmentId: department.id,
    },
  });

  const ticket = await prisma.ticket.create({
    data: {
      ticketNumber: "TKT-0000001",
      organizationId: organization.id,
      departmentId: department.id,
      subject: "Sample ticket — printer not working",
      requesterEmail: "customer@example.com",
      requesterName: "John Smith",
      status: "OPEN",
      priority: "MEDIUM",
      source: "MANUAL",
      messages: {
        create: {
          bodyText: "Printer on the second floor is not working.",
          fromEmail: "customer@example.com",
          fromName: "John Smith",
          toEmails: [],
          ccEmails: [],
          direction: "INBOUND",
          senderType: "CUSTOMER",
          source: "PLATFORM",
          sentAt: new Date(),
        },
      },
    },
  });

  console.log("Seed complete:\n");
  console.log(`  Organization: ${organization.name}`);
  console.log(`  Department:   ${department.name}`);
  console.log(`  Admin login:  ${admin.email} / ${SEED.adminPassword}  (sees ALL tickets)`);
  console.log(
    `  User login:   ${deptUser.email} / ${SEED.deptUserPassword}  (sees only "${department.name}" tickets)`
  );
  console.log(`  Sample ticket: ${ticket.ticketNumber} (in "${department.name}")`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
