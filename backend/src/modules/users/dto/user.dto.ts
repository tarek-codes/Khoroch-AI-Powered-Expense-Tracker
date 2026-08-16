import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { CurrencyCode } from '@/common/enums';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Tarek' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Rahman' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ enum: CurrencyCode, example: CurrencyCode.BDT })
  @IsOptional()
  @IsEnum(CurrencyCode)
  preferredCurrency?: CurrencyCode;

  @ApiPropertyOptional({ example: 'bn' })
  @IsOptional()
  @IsString()
  preferredLocale?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewStrongPassword456!', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
