import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParseVoiceDto {
  @ApiProperty({
    example: 'আজকে সকালে রিকশা ভাড়া ৫০ টাকা এবং দুপুরে কাচ্চি খেলাম ৩৫০ টাকা বিকাশ দিয়ে',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ example: 'bn', default: 'bn' })
  @IsOptional()
  @IsString()
  language?: string;
}
