import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import servicesConfig from './config/services.config';

import {
  User,
  Category,
  Subcategory,
  PaymentMethod,
  MonthlyBudget,
  Expense,
  ExpenseItem,
  Receipt,
  AiProcessingLog,
  SystemSetting,
  Loan,
} from './database/entities';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { LoansModule } from './modules/loans/loans.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, servicesConfig],
      envFilePath: ['../.env', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.user'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          ssl: { rejectUnauthorized: false },
          entities: [
            User,
            Category,
            Subcategory,
            PaymentMethod,
            MonthlyBudget,
            Expense,
            ExpenseItem,
            Receipt,
            AiProcessingLog,
            SystemSetting,
            Loan,
          ],
          synchronize: true, // auto synchronize schema in dev
          logging: false,
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    AuthModule,
    UsersModule,
    BudgetsModule,
    ExpensesModule,
    CategoriesModule,
    PaymentMethodsModule,
    AiModule,
    AnalyticsModule,
    AdminModule,
    LoansModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
