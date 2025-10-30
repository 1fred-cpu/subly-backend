import { DataSource, QueryRunner } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  createSystemEmailQueue,
  EMAIL_QUEUE,
  SYSTEM_EMAIL_QUEUE,
} from './email.queue';
import { EmailPayload, EmailType } from './types/email.type';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly queue = createSystemEmailQueue();
  constructor(private readonly dataSource: DataSource) {}

  // Used by system for sending email
  async sendEmail(type: EmailType, payload: EmailPayload) {
    try {
      await this.queue.add(
        SYSTEM_EMAIL_QUEUE,
        { type, payload },
        { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
      );
      this.logger.log(`Queued email to ${payload.to} (${type})`);
    } catch (error) {
      this.logger.error(`Failed to queue email: ${error.message}`);
      throw error;
    }
  }
}

/**
 * {
  "projectId":"8ff7c572-d526-43a2-b128-157b2dce0a16",
  "to":[
    {
      "email":"frederickfrimpong284@gmail.com"
    }
  ],
  "type":"Verification",
  "channels":["email"],
  "message":{
    "subject":"Verify Your Email",
    "body":"<h1>Hello Verify your email to get started</h1>"
  },
  "idempotencyKey":"12345"
}
 */
