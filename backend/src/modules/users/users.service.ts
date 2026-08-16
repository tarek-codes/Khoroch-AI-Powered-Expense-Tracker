import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { User } from '@/database/entities';
import { UpdateProfileDto, ChangePasswordDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const cloudName = this.configService.get<string>('services.cloudinary.cloudName');
    const apiKey = this.configService.get<string>('services.cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('services.cloudinary.apiSecret');
    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateProfileDto);
    return await this.userRepository.save(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'khoroch/avatars',
          transformation: [{ width: 300, height: 300, crop: 'fill' }],
        },
        async (error, result) => {
          if (error) {
            return reject(new BadRequestException('Failed to upload avatar to Cloudinary'));
          }
          user.avatarUrl = result.secure_url;
          const updatedUser = await this.userRepository.save(user);
          resolve({ avatarUrl: updatedUser.avatarUrl });
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
