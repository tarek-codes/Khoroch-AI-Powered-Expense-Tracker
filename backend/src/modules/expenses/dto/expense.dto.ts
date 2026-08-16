import {
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyCode, ExpenseSource } from '@/common/enums';

export class ExpenseItemDto {
  @ApiProperty({ example: 'Miniket Rice 5kg' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1.0 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @ApiProperty({ example: 450.0 })
  @IsNumber()
  @IsPositive()
  totalPrice: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateExpenseDto {
  @ApiProperty({ example: 350.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ enum: CurrencyCode, default: CurrencyCode.BDT })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @ApiProperty({ example: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({ example: 's1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ example: 'p1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: 'Lunch at restaurant' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'KFC Dhanmondi' })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiPropertyOptional({ example: 'With colleagues' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2026-08-16' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ example: '13:30:00' })
  @IsOptional()
  @IsString()
  expenseTime?: string;

  @ApiPropertyOptional({ type: [ExpenseItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseItemDto)
  items?: ExpenseItemDto[];
}

export class UpdateExpenseDto {
  @ApiPropertyOptional({ example: 400.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ enum: CurrencyCode })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;

  @ApiPropertyOptional({ example: 'c1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 's1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ example: 'p1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: 'Updated Lunch description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'KFC Dhanmondi' })
  @IsOptional()
  @IsString()
  merchant?: string;

  @ApiPropertyOptional({ example: 'Paid with bKash' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2026-08-16' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: '14:00:00' })
  @IsOptional()
  @IsString()
  expenseTime?: string;

  @ApiPropertyOptional({ type: [ExpenseItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseItemDto)
  items?: ExpenseItemDto[];
}

export class BatchConfirmExpensesDto {
  @ApiProperty({ enum: ExpenseSource, example: ExpenseSource.VOICE })
  @IsEnum(ExpenseSource)
  source: ExpenseSource;

  @ApiPropertyOptional({ example: 'log-uuid-1234' })
  @IsOptional()
  @IsUUID()
  aiLogId?: string;

  @ApiPropertyOptional({ example: 'rec-uuid-1234' })
  @IsOptional()
  @IsUUID()
  receiptId?: string;

  @ApiProperty({ type: [CreateExpenseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseDto)
  expenses: CreateExpenseDto[];
}

export class ExpenseQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  month?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  paymentMethodId?: string;

  @ApiPropertyOptional({ enum: ExpenseSource })
  @IsOptional()
  @IsEnum(ExpenseSource)
  source?: ExpenseSource;

  @ApiPropertyOptional({ default: 'true' })
  @IsOptional()
  isConfirmed?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 'expense_date' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'expenseDate';

  @ApiPropertyOptional({ default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
