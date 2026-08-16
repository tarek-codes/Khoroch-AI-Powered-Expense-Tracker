import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseVoiceDto } from './dto/ai.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('AI Processing')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('voice/parse')
  @ApiOperation({ summary: 'Parse expense details from speech text' })
  async parseVoice(
    @CurrentUser() user: User,
    @Body() parseVoiceDto: ParseVoiceDto,
  ) {
    const data = await this.aiService.parseVoice(
      user.id,
      parseVoiceDto.text,
      parseVoiceDto.language,
    );
    return { data };
  }

  @Post('voice/parse-audio')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Parse expense details directly from raw audio recording' })
  @UseInterceptors(FileInterceptor('file'))
  async parseVoiceAudio(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data = await this.aiService.parseVoiceAudio(user.id, file);
    return { data };
  }

  @Post('receipts/scan')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and analyze receipt image via AI/OCR' })
  @UseInterceptors(FileInterceptor('file'))
  async scanReceipt(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.aiService.scanReceipt(user.id, file);
    return {
      message: 'Receipt processed successfully',
      data,
    };
  }
}
