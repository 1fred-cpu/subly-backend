import { Queue } from 'bullmq';
import Redis from 'ioredis';
import 'dotenv/config';

// ==============================
// Constants
// ==============================
export const EMAIL_QUEUE = 'EMAIL_QUEUE';
export const SYSTEM_EMAIL_QUEUE = 'SYSTEM_EMAIL_QUEUE';

// ==============================
// Redis Connection
// ==============================
const redisConnection = new Redis(process.env.REDIS_URL!, {
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
  maxRetriesPerRequest: null, // prevent retry overflow
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    console.warn(`Redis reconnect attempt #${times}`);
    return delay;
  },
});

// ==============================
// System Email Queue
// Used for internal/system-triggered Email
// ==============================
export const createSystemEmailQueue = () =>
  new Queue(SYSTEM_EMAIL_QUEUE, {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  });
export { redisConnection };
