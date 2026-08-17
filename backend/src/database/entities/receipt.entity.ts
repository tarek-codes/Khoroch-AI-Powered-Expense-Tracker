import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { ReceiptProcessingStatus } from '@/common/enums';
import { User } from './user.entity';
import { Expense } from './expense.entity';

@Entity('receipts')
@Check(`"mime_type" IN ('image/jpeg', 'image/png', 'image/webp')`)
@Check(`"processing_status" IN ('pending', 'processing', 'completed', 'failed')`)
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'expense_id', type: 'uuid', nullable: true })
  expenseId: string;

  @OneToOne(() => Expense, (expense) => expense.receipt, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'expense_id' })
  expense: Expense;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.receipts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'original_filename', type: 'varchar', length: 255 })
  originalFilename: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'ai_extracted_data', type: 'jsonb', nullable: true })
  aiExtractedData: Record<string, any>;

  @Index()
  @Column({
    name: 'processing_status',
    type: 'varchar',
    length: 20,
    default: ReceiptProcessingStatus.PENDING,
  })
  processingStatus: ReceiptProcessingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
