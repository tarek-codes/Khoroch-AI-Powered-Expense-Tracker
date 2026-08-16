import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@/common/enums';

export class CreateAdminCategoryDto {
  @ApiProperty({ example: 'Utilities' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'ইউটিলিটি' })
  @IsOptional()
  @IsString()
  nameBn?: string;

  @ApiPropertyOptional({ example: 'zap' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateAdminCategoryDto {
  @ApiPropertyOptional({ example: 'Utilities' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ইউটিলিটি' })
  @IsOptional()
  @IsString()
  nameBn?: string;

  @ApiPropertyOptional({ example: 'zap' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateAdminSubcategoryDto {
  @ApiProperty({ example: 'Electricity Bill' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'বিদ্যুৎ বিল' })
  @IsOptional()
  @IsString()
  nameBn?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class CreateAdminPaymentMethodDto {
  @ApiProperty({ example: 'Upay' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'উপায়' })
  @IsOptional()
  @IsString()
  nameBn?: string;

  @ApiPropertyOptional({ example: 'wallet' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 9 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateSettingDto {
  @ApiProperty({ example: 15 })
  value: any;
}
