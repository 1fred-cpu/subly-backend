import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (company) => company.subscriptions)
  @JoinColumn({ name: 'companyId', referencedColumnName: 'id' })
  company: Company;

  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'int' })
  cost: number;

  @Column({ type: 'text' })
  billingCycle: string;

  @Column({ type: 'timestamptz' })
  renewalDate: Date;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'text' })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
