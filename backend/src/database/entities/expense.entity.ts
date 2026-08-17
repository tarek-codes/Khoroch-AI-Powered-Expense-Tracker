import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { CurrencyCode, ExpenseSource } from '@/common/enums';
import { User } from './user.entity';
import { MonthlyBudget } from './monthly-budget.entity';
import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity';
import { PaymentMethod } from './payment-method.entity';
import { ExpenseItem } from './expense-item.entity';
import { Receipt } from './receipt.entity';

@Entity('expenses')
@Check(`"amount" > 0`)
@Check(`"ai_confidence" IS NULL OR ("ai_confidence" >= 0.00 AND "ai_confidence" <= 1.00)`)
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'monthly_budget_id', type: 'uuid' })
  monthlyBudgetId: string;

  @ManyToOne(() => MonthlyBudget, (budget) => budget.expenses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'monthly_budget_id' })
  monthlyBudget: MonthlyBudget;

  @Index()
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.expenses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'subcategory_id', type: 'uuid', nullable: true })
  subcategoryId: string;

  @ManyToOne(() => Subcategory, (sub) => sub.expenses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId: string;

  @ManyToOne(() => PaymentMethod, (pm) => pm.expenses, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: CurrencyCode,
    default: CurrencyCode.BDT,
  })
  currency: CurrencyCode;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchant: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Index()
  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: string;

  @Column({ name: 'expense_time', type: 'time', nullable: true })
  expenseTime: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ExpenseSource,
    default: ExpenseSource.MANUAL,
  })
  source: ExpenseSource;

  @Index()
  @Column({ name: 'is_confirmed', type: 'boolean', default: false })
  isConfirmed: boolean;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ name: 'ai_raw_text', type: 'text', nullable: true })
  aiRawText: string;

  @Column({
    name: 'ai_confidence',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  aiConfidence: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ExpenseItem, (item) => item.expense, { cascade: true })
  items: ExpenseItem[];

  @OneToOne(() => Receipt, (receipt) => receipt.expense)
  receipt: Receipt;
}
