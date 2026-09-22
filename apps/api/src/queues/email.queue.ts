import { Queue } from "bullmq";
import { redisConnection } from "../lib/redis";

// Queue names are shared with apps/worker — keep these in sync.
export const QUEUE_NAMES = {
  EMAIL_INCOMING: "email.incoming",
  EMAIL_OUTGOING: "email.outgoing",
  EMAIL_RECONCILIATION: "email.reconciliation",
} as const;

export const emailIncomingQueue = new Queue(QUEUE_NAMES.EMAIL_INCOMING, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: false, // keep failed jobs visible for the dead-letter view
  },
});

export const emailOutgoingQueue = new Queue(QUEUE_NAMES.EMAIL_OUTGOING, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: false,
  },
});
