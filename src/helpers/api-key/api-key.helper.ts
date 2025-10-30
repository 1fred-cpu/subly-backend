import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHmac, timingSafeEqual } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '@entities/user.entity';

@Injectable()
export class ApiKeyHelper {
  private readonly API_KEY_SECRET =
    process.env.API_KEY_SECRET || 'default_api_secret';

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  /**
   * Generate a new API key pair (raw + hashed)
   */
  async generateKey(): Promise<{
    rawKey: string;
  }> {
    const prefix = 'signal_live_';
    const rawKey = prefix + randomBytes(32).toString('hex');
    // const hashedKey = await bcrypt.hash(rawKey + this.API_KEY_SECRET, 10);
    return { rawKey };
  }

  /**
   * Fingerprint for logging (safe short hash)
   */
  fingerprint(apiKey: string): string {
    const hmac = createHmac('sha256', this.API_KEY_SECRET)
      .update(apiKey)
      .digest('hex');
    return hmac.slice(0, 12);
  }
  c;

  /**
   * Safe compare for timing attack prevention
   */
  safeCompare(a: string, b: string): boolean {
    const buffA = Buffer.from(a);
    const buffB = Buffer.from(b);

    if (buffA.length !== buffB.length) return false;
    return timingSafeEqual(buffA, buffB);
  }
}
