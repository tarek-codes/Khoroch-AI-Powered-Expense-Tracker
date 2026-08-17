import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription, Category } from '@/database/entities';
import { ExpensesModule } from '@/modules/expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Category]),
    ExpensesModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
