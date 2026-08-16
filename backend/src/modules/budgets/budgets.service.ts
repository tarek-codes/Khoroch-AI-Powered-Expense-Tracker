import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyBudget, Expense, Loan, LoanType, LoanStatus } from '@/database/entities';
import { SetBudgetDto, UpdateBudgetDto, BudgetQueryDto } from './dto/budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(MonthlyBudget)
    private budgetRepository: Repository<MonthlyBudget>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Loan)
    private loanRepository: Repository<Loan>,
  ) {}

  async getSummary(userId: string, query: BudgetQueryDto) {
    const now = new Date();
    const month = query.month || now.getMonth() + 1;
    const year = query.year || now.getFullYear();

    let budget = await this.budgetRepository.findOne({
      where: { userId, month, year },
    });

    if (!budget) {
      // Auto create or return zero-budget summary
      budget = this.budgetRepository.create({
        userId,
        month,
        year,
        startingBalance: 0,
      });
    }

    // Compute total confirmed spent for this month/year
    const expenseQuery = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.user_id = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.expense_date) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expense.expense_date) = :year', { year })
      .andWhere('expense.is_confirmed = true')
      .getRawOne();

    const totalSpent = parseFloat(expenseQuery?.total || '0');

    // Compute active Lend & Borrow impact:
    // When you lend money (pending): money is out of your wallet (-lent)
    // When you borrow money (pending): money is in your wallet (+borrowed)
    const activeLoans = await this.loanRepository.find({
      where: { userId, status: LoanStatus.PENDING },
    });

    let totalLentPending = 0;
    let totalBorrowedPending = 0;
    for (const l of activeLoans) {
      const amt = Number(l.amount) || 0;
      if (l.type === LoanType.LEND) {
        totalLentPending += amt;
      } else if (l.type === LoanType.BORROW) {
        totalBorrowedPending += amt;
      }
    }

    const startingBalance = Number(budget.startingBalance || 0);
    // Remaining balance accounts for spent expenses as well as net active loans (borrowed adds, lent cuts)
    const remainingBalance = startingBalance - totalSpent - totalLentPending + totalBorrowedPending;
    const spendingPercentage =
      startingBalance > 0
        ? parseFloat(((totalSpent / startingBalance) * 100).toFixed(2))
        : 0;

    return {
      budgetId: budget.id || null,
      month,
      year,
      currency: budget.currency || 'BDT',
      startingBalance,
      totalSpent,
      remainingBalance,
      spendingPercentage,
      totalLentPending,
      totalBorrowedPending,
      isOverBudget: remainingBalance < 0,
      isLowBalance:
        startingBalance > 0 && remainingBalance > 0 && spendingPercentage >= 90,
    };
  }

  async getHistory(userId: string, year?: number) {
    const query = this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.user_id = :userId', { userId })
      .orderBy('budget.year', 'DESC')
      .addOrderBy('budget.month', 'DESC');

    if (year) {
      query.andWhere('budget.year = :year', { year });
    }

    const budgets = await query.getMany();

    // Map computed spending totals for each budget
    const result = await Promise.all(
      budgets.map(async (b) => {
        const expenseQuery = await this.expenseRepository
          .createQueryBuilder('expense')
          .select('SUM(expense.amount)', 'total')
          .where('expense.user_id = :userId', { userId })
          .andWhere('EXTRACT(MONTH FROM expense.expense_date) = :month', {
            month: b.month,
          })
          .andWhere('EXTRACT(YEAR FROM expense.expense_date) = :year', {
            year: b.year,
          })
          .andWhere('expense.is_confirmed = true')
          .getRawOne();

        const totalSpent = parseFloat(expenseQuery?.total || '0');
        const startingBalance = Number(b.startingBalance || 0);
        return {
          id: b.id,
          month: b.month,
          year: b.year,
          startingBalance,
          totalSpent,
          remainingBalance: startingBalance - totalSpent,
          spendingPercentage:
            startingBalance > 0
              ? parseFloat(((totalSpent / startingBalance) * 100).toFixed(2))
              : 0,
          currency: b.currency,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        };
      }),
    );

    return result;
  }

  async setBudget(userId: string, setBudgetDto: SetBudgetDto) {
    const existing = await this.budgetRepository.findOne({
      where: {
        userId,
        month: setBudgetDto.month,
        year: setBudgetDto.year,
      },
    });

    if (existing) {
      existing.startingBalance = setBudgetDto.startingBalance;
      if (setBudgetDto.currency) {
        existing.currency = setBudgetDto.currency;
      }
      return await this.budgetRepository.save(existing);
    }

    const budget = this.budgetRepository.create({
      userId,
      ...setBudgetDto,
    });
    return await this.budgetRepository.save(budget);
  }

  async updateBudget(userId: string, budgetId: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.budgetRepository.findOne({
      where: { id: budgetId, userId },
    });
    if (!budget) {
      throw new NotFoundException('Budget record not found');
    }

    budget.startingBalance = updateBudgetDto.startingBalance;
    return await this.budgetRepository.save(budget);
  }

  async findOrCreateBudgetForDate(userId: string, dateStr: string): Promise<MonthlyBudget> {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    let budget = await this.budgetRepository.findOne({
      where: { userId, month, year },
    });

    if (!budget) {
      budget = this.budgetRepository.create({
        userId,
        month,
        year,
        startingBalance: 0,
      });
      budget = await this.budgetRepository.save(budget);
    }

    return budget;
  }
}
