import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Category,
  PaymentMethod,
  Receipt,
  AiProcessingLog,
} from '@/database/entities';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      PaymentMethod,
      Receipt,
      AiProcessingLog,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
