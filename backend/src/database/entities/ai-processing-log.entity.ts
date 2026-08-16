import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { AiLogType } from '@/common/enums';
import { User } from './user.entity';
import { Receipt } from './receipt.entity';

@Entity('ai_processing_logs')
@Check(`"type" IN ('voice', 'receipt')`)
export class AiProcessingLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.aiLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({
    type: 'varchar',
    length: 20,
  })
  type: AiLogType;

  @Column({ name: 'input_language', type: 'varchar', length: 5, nullable: true })
  inputLanguage: string;

  @Column({ name: 'input_text', type: 'text', nullable: true })
  inputText: string;

  @Column({ name: 'receipt_id', type: 'uuid', nullable: true })
  receiptId: string;

  @ManyToOne(() => Receipt, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;

  @Column({ name: 'output_data', type: 'jsonb', nullable: true })
  outputData: Record<string, any>;

  @Column({ name: 'expenses_created', type: 'integer', default: 0 })
  expensesCreated: number;

  @Column({ name: 'was_confirmed', type: 'boolean', default: false })
  wasConfirmed: boolean;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'processing_time_ms', type: 'integer', nullable: true })
  processingTimeMs: number;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
