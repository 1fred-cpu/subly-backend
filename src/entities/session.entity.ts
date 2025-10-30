import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index(['user'])
@Index(['refreshTokenHash'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Relation: User owning this session ---
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  // --- Token Management ---
  @Column({ nullable: true,})
  accessTokenHash?: string;

  @Column({ type: 'timestamptz', nullable: true })
  accessTokenExpiresAt?: Date;

  @Column({ nullable: true, })
  refreshTokenHash?: string;

  @Column({ type: 'timestamptz', nullable: true })
  refreshTokenExpiresAt?: Date;

  // --- Session Active State ---
  @Column({ default: true })
  active: boolean;

  // --- Device / Client Info ---
  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  // --- Security / Metadata ---
  @Column({ default: false })
  isCurrent: boolean;

  @Column({ default: false })
  isExpired: boolean;

  // --- Timestamps ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
