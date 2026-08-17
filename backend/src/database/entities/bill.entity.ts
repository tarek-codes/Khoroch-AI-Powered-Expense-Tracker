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

export enum BillStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
}

@Entity('utility_bills')
@Index(['userId', 'status'])
@Index(['userId', 'billingMonth'])
export class UtilityBill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'receiver_name', length: 150 })
  receiverName: string; // e.g., DESCO, DPDC, WASA, Titas Gas, Dot Internet

  @Column({ length: 100, default: 'Electricity' })
  category: string; // Electricity, Water, Gas, Internet, Telephone, Waste Management, Service Charge

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'billing_month', length: 7 }) // YYYY-MM (e.g. 2026-08)
  billingMonth: string;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.UNPAID,
  })
  status: BillStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'expense_id', type: 'uuid', nullable: true })
  expenseId: string; // ID of the expense record created upon paying to deduct balance

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
