import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanType, LoanStatus } from '@/database/entities';

export class CreateLoanDto {
  @ApiProperty({ enum: LoanType, example: LoanType.LEND })
  @IsEnum(LoanType)
  type: LoanType;

  @ApiProperty({ example: 'Rahim' })
  @IsString()
  personName: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: '2026-08-16T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;

  @ApiPropertyOptional({ example: '2026-08-30T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Borrowed for emergency hospital bill' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLoanDto {
  @ApiPropertyOptional({ example: 'Rahim' })
  @IsOptional()
  @IsString()
  personName?: string;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({ enum: LoanStatus, example: LoanStatus.SETTLED })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({ example: '2026-08-30T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Settled via bKash' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LoanQueryDto {
  @ApiPropertyOptional({ enum: LoanType })
  @IsOptional()
  @IsEnum(LoanType)
  type?: LoanType;

  @ApiPropertyOptional({ enum: LoanStatus })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({ example: 'Rahim' })
  @IsOptional()
  @IsString()
  search?: string;
}
