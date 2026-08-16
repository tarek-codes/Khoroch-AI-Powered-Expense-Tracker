import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Subcategory } from './subcategory.entity';
import { Expense } from './expense.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ name: 'name_bn', type: 'varchar', length: 100, nullable: true })
  nameBn: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string;

  @Index()
  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Index()
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Subcategory, (sub) => sub.category)
  subcategories: Subcategory[];

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];
}
