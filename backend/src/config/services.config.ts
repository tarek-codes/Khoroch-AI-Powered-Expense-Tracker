import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  frontendUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT, 10) || 3001,
}));
