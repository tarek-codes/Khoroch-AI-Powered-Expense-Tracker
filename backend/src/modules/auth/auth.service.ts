import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '@/database/entities';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '@/common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.USER,
    });

    const savedUser = await this.userRepository.save(user);
    const tokens = this.generateTokens(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        preferredCurrency: savedUser.preferredCurrency,
        preferredLocale: savedUser.preferredLocale,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: loginDto.email.toLowerCase() })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        preferredCurrency: user.preferredCurrency,
        preferredLocale: user.preferredLocale,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const refreshSecret =
        this.configService.get<string>('jwt.refreshSecret') ||
        'defaultRefreshKeyForKhorochApp2026';
      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token or user not active');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('jwt.secret') ||
        'defaultSecretKeyForKhorochApp2026',
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        'defaultRefreshKeyForKhorochApp2026',
      expiresIn:
        (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
