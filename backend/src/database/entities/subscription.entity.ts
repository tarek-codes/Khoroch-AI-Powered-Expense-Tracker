import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum SubscriptionStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

export enum SubscriptionBillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  WEEKLY = 'weekly',
}

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['userId', 'billingMonth'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'service_name', length: 150 })
  serviceName: string; // e.g. Netflix, Spotify, ChatGPT Plus, YouTube Premium, Hosting, Gym

  @Column({ length: 100, default: 'Entertainment' })
  category: string; // Streaming, Software, Cloud/Hosting, Fitness, Gaming, Education

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'billing_month', length: 7 }) // YYYY-MM
  billingMonth: string;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: SubscriptionBillingCycle,
    default: SubscriptionBillingCycle.MONTHLY,
  })
  billingCycle: SubscriptionBillingCycle;

  @Column({ name: 'renewal_date', type: 'date', nullable: true })
  renewalDate: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.UNPAID,
  })
  status: SubscriptionStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'expense_id', type: 'uuid', nullable: true })
  expenseId: string; // Linked expense record when paid to automatically deduct budget balance

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
