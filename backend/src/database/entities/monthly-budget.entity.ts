import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
  Check,
} from 'typeorm';
import { CurrencyCode } from '@/common/enums';
import { User } from './user.entity';
import { Expense } from './expense.entity';

@Entity('monthly_budgets')
@Unique(['user', 'month', 'year'])
@Check(`"month" >= 1 AND "month" <= 12`)
@Check(`"year" >= 2000 AND "year" <= 2100`)
export class MonthlyBudget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'smallint' })
  month: number;

  @Column({ type: 'smallint' })
  year: number;

  @Column({
    name: 'starting_balance',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  startingBalance: number;

  @Column({
    type: 'enum',
    enum: CurrencyCode,
    default: CurrencyCode.BDT,
  })
  currency: CurrencyCode;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Expense, (expense) => expense.monthlyBudget)
  expenses: Expense[];
}
