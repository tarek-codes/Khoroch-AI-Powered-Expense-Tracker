import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Expense,
  ExpenseItem,
  Receipt,
  AiProcessingLog,
} from '@/database/entities';
import { BudgetsModule } from '@/modules/budgets/budgets.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseItem,
      Receipt,
      AiProcessingLog,
    ]),
    BudgetsModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
