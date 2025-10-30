import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { Company } from './company.entity';

export enum AuthProviders {
  EMAIL = 'email',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' })
  company: Company;

  // --- Basic Info ---
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  passwordHash: string;

  @Column({ nullable: true, type: 'text' })
  profileImageUrl?: string;

  // --- Verification and Authentication ---
  @Column({ default: false, type: 'boolean' })
  emailVerified: boolean;

  @Column({ type: 'enum', enum: AuthProviders, default: AuthProviders.EMAIL })
  authProvider: AuthProviders;

  @Column({ nullable: true, select: false, type: 'text' })
  emailVerificationToken?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerificationExpiresAt?: Date | null;

  @Column({ nullable: true, select: false, type: 'text' })
  passwordResetToken?: string;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpiresAt?: Date;

  //--- Role / Permission Control ---
  @Column({ type: 'text' })
  role: string;

  @Column({ type: 'text', nullable: true })
  department: string | null;

  // --- Account Management ---
  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @Column({ default: false, type: 'boolean' })
  isSuspended: boolean;

  // --- Timestamps ---
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // --- Hooks / Helper Logic ---

  @BeforeInsert()
  async hashPassword() {
    if (this.passwordHash) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
  }

  generateEmailVerificationToken() {
    this.emailVerificationToken = randomBytes(32).toString('hex');
    this.emailVerificationExpiresAt = new Date(
      Date.now() + 1000 * 60 * 60 * 24,
    ); // 24 hours
    return this.emailVerificationToken;
  }

  generatePasswordResetToken() {
    this.passwordResetToken = randomBytes(32).toString('hex');
    this.passwordResetExpiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
  }

  verifyEmail() {
    this.emailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpiresAt = null;
  }
}
