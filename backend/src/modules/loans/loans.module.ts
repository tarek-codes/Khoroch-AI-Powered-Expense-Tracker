import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loan } from '@/database/entities';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
