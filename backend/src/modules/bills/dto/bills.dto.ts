import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillStatus } from '@/database/entities';

export class CreateBillDto {
  @ApiProperty({ example: 'DESCO Electricity Bill' })
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @ApiProperty({ example: 'Electricity' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 1450.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: '2026-08' })
  @IsString()
  @IsOptional()
  billingMonth?: string;

  @ApiPropertyOptional({ example: '2026-08-25' })
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Meter #4928192' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateBillDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  receiverName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  billingMonth?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: BillStatus })
  @IsEnum(BillStatus)
  @IsOptional()
  status?: BillStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BillQueryDto {
  @ApiPropertyOptional({ example: '2026-08' })
  @IsString()
  @IsOptional()
  month?: string;

  @ApiPropertyOptional({ enum: BillStatus })
  @IsEnum(BillStatus)
  @IsOptional()
  status?: BillStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
