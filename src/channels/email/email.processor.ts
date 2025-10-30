import { Worker, Job } from 'bullmq';
import { Resend } from 'resend';
import Redis from 'ioredis';
import 'dotenv/config';
import dataSource from 'src/database/data-source';
import { SYSTEM_EMAIL_QUEUE } from './email.queue';
import { EmailPayload, EmailType } from './types/email.type';

import { verificationTemplate } from './templates/verification.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { redisConnection as emailRedisConnection } from './email.queue';
// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY!);

// Helper: Idempotency checker
async function isDuplicateAndMark(
  redis: Redis,
  key: string,
  expirySeconds = 3600, // 1 hour
): Promise<boolean> {
  const result = await redis.set(key, 'sent', 'EX', expirySeconds, 'NX');
  return result === null; // If null, it means duplicate
}

/**
 * System email worker
 */
export const SystemEmailWorker = new Worker(
  SYSTEM_EMAIL_QUEUE,
  async (job: Job<{ type: EmailType; payload: EmailPayload }>) => {
    const { type, payload } = job.data;
    const { idempotencyKey, to } = payload;

    try {
      // Idempotency: prevent duplicate sends
      if (idempotencyKey) {
        const redisKey = `email:idempotent:${idempotencyKey}`;
        const isDuplicate = await isDuplicateAndMark(
          emailRedisConnection,
          redisKey,
        );
        if (isDuplicate) {
          console.log(`Skipped duplicate email for key: ${idempotencyKey}`);
          return { status: 'skipped', reason: 'duplicate' };
        }
      }

      // Prepare content
      let subject: string;
      let html: string;

      switch (type) {
        case 'verification':
          subject = 'Verify Your SignalDeck Account';
          html = verificationTemplate(payload);
          break;

        case 'password_reset':
          subject = 'Reset Your SignalDeck Password';
          html = passwordResetTemplate(payload);
          break;

        case 'welcome':
          subject = 'Welcome to SignalDeck';
          html = welcomeTemplate(payload);
          break;

        default:
          subject = 'SignalDeck Notification';
          html = '<p>No valid template found for this email type.</p>';
          break;
      }

      // Send email via Resend
      await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to,
        subject,
        html,
      });

      console.log(
        `Email sent: ${subject} → ${Array.isArray(to) ? to.join(', ') : to}`,
      );
      return { status: 'sent', type, to };
    } catch (error) {
      console.error(`Failed to send email (${type}) to ${to}:`, error.message);
      return { status: 'failed', type, to, error: error.message };
    }
  },
  {
    connection: emailRedisConnection,
    concurrency: 10, // How many emails processed at once
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400, count: 500 },
  },
);

/*  Worker Lifecycle Events */

// System email worker events
SystemEmailWorker.on('completed', (job) => {
  console.log(`[SystemEmailWorker]  Completed job ${job.id}`);
});

SystemEmailWorker.on('failed', (job, err) => {
  console.error(`[SystemEmailWorker]  Failed job ${job?.id}: ${err.message}`);
});

SystemEmailWorker.on('error', (err) => {
  console.error('[SystemEmailWorker]  Redis/Worker error:', err);
});
