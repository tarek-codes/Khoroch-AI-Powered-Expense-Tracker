import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'defaultSecretKeyForKhorochApp2026',
  expiresIn: process.env.JWT_EXPIRATION || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'defaultRefreshKeyForKhorochApp2026',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
