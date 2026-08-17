import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionStatus, SubscriptionBillingCycle } from '@/database/entities';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'Netflix Premium' })
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({ example: 'Entertainment' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 1200.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ example: '2026-08' })
  @IsString()
  @IsOptional()
  billingMonth?: string;

  @ApiPropertyOptional({ enum: SubscriptionBillingCycle, default: SubscriptionBillingCycle.MONTHLY })
  @IsEnum(SubscriptionBillingCycle)
  @IsOptional()
  billingCycle?: SubscriptionBillingCycle;

  @ApiPropertyOptional({ example: '2026-08-28' })
  @IsString()
  @IsOptional()
  renewalDate?: string;

  @ApiPropertyOptional({ example: 'Shared with 4 screens' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSubscriptionDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serviceName?: string;

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

  @ApiPropertyOptional({ enum: SubscriptionBillingCycle })
  @IsEnum(SubscriptionBillingCycle)
  @IsOptional()
  billingCycle?: SubscriptionBillingCycle;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  renewalDate?: string;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SubscriptionQueryDto {
  @ApiPropertyOptional({ example: '2026-08' })
  @IsString()
  @IsOptional()
  month?: string;

  @ApiPropertyOptional({ enum: SubscriptionStatus })
  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
