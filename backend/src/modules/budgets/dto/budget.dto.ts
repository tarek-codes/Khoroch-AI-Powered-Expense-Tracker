import { IsInt, Min, Max, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CurrencyCode } from '@/common/enums';

export class SetBudgetDto {
  @ApiProperty({ example: 8, minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2026, minimum: 2000, maximum: 2100 })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 50000.0 })
  @IsNumber()
  @Min(0)
  startingBalance: number;

  @ApiPropertyOptional({ enum: CurrencyCode, default: CurrencyCode.BDT })
  @IsOptional()
  @IsEnum(CurrencyCode)
  currency?: CurrencyCode;
}

export class UpdateBudgetDto {
  @ApiProperty({ example: 55000.0 })
  @IsNumber()
  @Min(0)
  startingBalance: number;
}

export class BudgetQueryDto {
  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
