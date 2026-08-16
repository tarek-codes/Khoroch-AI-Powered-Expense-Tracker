import {
  Controller,
  Get,
  Patch,
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
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    const data = await this.usersService.getProfile(user.id);
    return { data };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile and preferences' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(user.id, updateProfileDto);
    return {
      message: 'Profile updated successfully',
      data,
    };
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const data = await this.usersService.changePassword(
      user.id,
      changePasswordDto,
    );
    return data;
  }

  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user profile picture' })
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.usersService.uploadAvatar(user.id, file);
    return {
      message: 'Avatar uploaded successfully',
      data,
    };
  }
}
