import "dotenv/config";
import { Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";
import { processIncomingEmail } from "./processors/emailProcessor";

const connection = new IORedis({
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
  maxRetriesPerRequest: null,
});

const emailIncomingWorker = new Worker("email.incoming", processIncomingEmail, {
  connection,
  concurrency: 5,
});

const emailIncomingEvents = new QueueEvents("email.incoming", { connection });

emailIncomingWorker.on("completed", (job, result) => {
  console.log(`[email.incoming] job ${job.id} completed:`, result);
});

emailIncomingWorker.on("failed", (job, err) => {
  console.error(`[email.incoming] job ${job?.id} failed:`, err.message);
  // After all retry attempts (see queue defaultJobOptions.attempts in the API)
  // BullMQ keeps this in the queue's failed set — that IS the dead-letter
  // queue referenced in plan section 38. Build an admin view over
  // queue.getFailed() rather than a separate table.
});

console.log("Worker started. Listening on queue: email.incoming");

process.on("SIGTERM", async () => {
  await emailIncomingWorker.close();
  await emailIncomingEvents.close();
  process.exit(0);
});
