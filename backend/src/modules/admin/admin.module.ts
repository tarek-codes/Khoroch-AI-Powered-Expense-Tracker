import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  User,
  Category,
  Subcategory,
  PaymentMethod,
  Expense,
  AiProcessingLog,
  SystemSetting,
} from '@/database/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Category,
      Subcategory,
      PaymentMethod,
      Expense,
      AiProcessingLog,
      SystemSetting,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
