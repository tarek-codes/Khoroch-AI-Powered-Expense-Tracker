import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole, CurrencyCode } from '@/common/enums';
import { MonthlyBudget } from './monthly-budget.entity';
import { Expense } from './expense.entity';
import { Receipt } from './receipt.entity';
import { AiProcessingLog } from './ai-processing-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'preferred_currency',
    type: 'enum',
    enum: CurrencyCode,
    default: CurrencyCode.BDT,
  })
  preferredCurrency: CurrencyCode;

  @Column({ name: 'preferred_locale', type: 'varchar', length: 5, default: 'en' })
  preferredLocale: string;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => MonthlyBudget, (budget) => budget.user)
  budgets: MonthlyBudget[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => Receipt, (receipt) => receipt.user)
  receipts: Receipt[];

  @OneToMany(() => AiProcessingLog, (log) => log.user)
  aiLogs: AiProcessingLog[];
}
