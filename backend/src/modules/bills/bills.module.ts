import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillsController } from './bills.controller';
import { BillsService } from './bills.service';
import { UtilityBill, Category } from '@/database/entities';
import { ExpensesModule } from '@/modules/expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UtilityBill, Category]),
    ExpensesModule,
  ],
  controllers: [BillsController],
  providers: [BillsService],
  exports: [BillsService],
})
export class BillsModule {}
