import {
  IsUUID,
  IsString,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
} from 'class-validator';

export type EmailType =
  | 'verification'
  | 'password_reset'
  | 'welcome'
  | 'custom';

export class EmailPayload {
  to: string; // recipient email
  name?: string; // recipient name
  url?: string; // optional URL (for verification/reset links)
  token?: string; // optional token
  subject?: string; // optional custom subject
  customHtml?: string; // for sending fully custom HTML
  idempotencyKey?: string; // key used to execute one operation
}

export class TemplateData {
  name?: string;
  url?: string;
  token?: string;
}

export class EmailNotificationPayload {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsArray()
  to: string[];

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  message: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  notificationId?: string;
}
