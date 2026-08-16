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

export enum LoanType {
  LEND = 'lend', // I gave money to someone (cash outflow from my balance)
  BORROW = 'borrow', // I took money from someone (cash inflow to my balance)
}

export enum LoanStatus {
  PENDING = 'pending', // Active / Unsettled
  SETTLED = 'settled', // Paid back
}

@Entity('loans')
@Index(['userId', 'status'])
@Index(['userId', 'type'])
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: LoanType,
    default: LoanType.LEND,
  })
  type: LoanType;

  @Column({ name: 'person_name', length: 150 })
  personName: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'transaction_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: LoanStatus,
    default: LoanStatus.PENDING,
  })
  status: LoanStatus;

  @Column({ name: 'settled_at', type: 'timestamp', nullable: true })
  settledAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
