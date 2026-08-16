import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expense } from './expense.entity';

@Entity('expense_items')
export class ExpenseItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'expense_id', type: 'uuid' })
  expenseId: string;

  @ManyToOne(() => Expense, (expense) => expense.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_id' })
  expense: Expense;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 1.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  unitPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalPrice: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
