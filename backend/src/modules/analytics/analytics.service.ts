import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, MonthlyBudget } from '@/database/entities';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(MonthlyBudget)
    private budgetRepository: Repository<MonthlyBudget>,
  ) {}

  async getDashboard(userId: string, month?: number, year?: number) {
    const now = new Date();
    const currentMonth = month || now.getMonth() + 1;
    const currentYear = year || now.getFullYear();

    const budget = await this.budgetRepository.findOne({
      where: { userId, month: currentMonth, year: currentYear },
    });

    const startingBalance = Number(budget?.startingBalance || 0);

    const expenseQuery = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.expenseDate) = :month', {
        month: currentMonth,
      })
      .andWhere('EXTRACT(YEAR FROM expense.expenseDate) = :year', {
        year: currentYear,
      })
      .andWhere('expense.isConfirmed = true')
      .getRawOne();

    const totalSpent = parseFloat(expenseQuery?.total || '0');
    const remainingBalance = startingBalance - totalSpent;
    const spendingPercentage =
      startingBalance > 0
        ? parseFloat(((totalSpent / startingBalance) * 100).toFixed(2))
        : 0;

    // Recent 5 expenses
    const recentExpenses = await this.expenseRepository.find({
      where: { userId, isConfirmed: true },
      relations: ['category', 'paymentMethod'],
      order: { expenseDate: 'DESC', createdAt: 'DESC' },
      take: 5,
    });

    // Top categories for this month
    const topCategoriesRaw = await this.expenseRepository
      .createQueryBuilder('expense')
      .innerJoin('expense.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'categoryName')
      .addSelect('category.nameBn', 'categoryNameBn')
      .addSelect('category.color', 'categoryColor')
      .addSelect('category.icon', 'categoryIcon')
      .addSelect('SUM(expense.amount)', 'totalSpent')
      .where('expense.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.expenseDate) = :month', {
        month: currentMonth,
      })
      .andWhere('EXTRACT(YEAR FROM expense.expenseDate) = :year', {
        year: currentYear,
      })
      .andWhere('expense.isConfirmed = true')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.nameBn')
      .addGroupBy('category.color')
      .addGroupBy('category.icon')
      .orderBy('"totalSpent"', 'DESC')
      .getRawMany();

    const topCategories = topCategoriesRaw.map((tc) => {
      const catTotal = parseFloat(tc.totalSpent || '0');
      return {
        categoryId: tc.categoryId,
        categoryName: tc.categoryName,
        categoryNameBn: tc.categoryNameBn,
        categoryColor: tc.categoryColor,
        categoryIcon: tc.categoryIcon,
        totalSpent: catTotal,
        percentage:
          totalSpent > 0
            ? parseFloat(((catTotal / totalSpent) * 100).toFixed(2))
            : 0,
      };
    });

    return {
      budget: {
        startingBalance,
        totalSpent,
        remainingBalance,
        spendingPercentage,
        currency: budget?.currency || 'BDT',
      },
      recentExpenses: recentExpenses.map((e) => ({
        id: e.id,
        amount: e.amount,
        currency: e.currency,
        description: e.description,
        merchant: e.merchant,
        categoryName: e.category?.name,
        categoryNameBn: e.category?.nameBn,
        categoryIcon: e.category?.icon,
        categoryColor: e.category?.color,
        expenseDate: e.expenseDate,
        paymentMethod: e.paymentMethod?.name,
      })),
      topCategories,
    };
  }

  async getBreakdown(
    userId: string,
    startDate?: string,
    endDate?: string,
    groupBy = 'category',
  ) {
    const qb = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.isConfirmed = true');

    if (startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', { endDate });
    }

    if (groupBy === 'payment_method') {
      qb.leftJoin('expense.paymentMethod', 'pm')
        .select('COALESCE(pm.name, \'Other\')', 'name')
        .addSelect('pm.id', 'id')
        .addSelect('SUM(expense.amount)', 'total')
        .groupBy('pm.name')
        .addGroupBy('pm.id');
    } else {
      qb.leftJoin('expense.category', 'cat')
        .select('cat.name', 'name')
        .addSelect('cat.id', 'id')
        .addSelect('cat.color', 'color')
        .addSelect('SUM(expense.amount)', 'total')
        .groupBy('cat.name')
        .addGroupBy('cat.id')
        .addGroupBy('cat.color');
    }

    const rows = await qb.orderBy('"total"', 'DESC').getRawMany();
    const overallTotal = rows.reduce((acc, r) => acc + parseFloat(r.total || '0'), 0);

    return rows.map((r) => {
      const amount = parseFloat(r.total || '0');
      return {
        id: r.id,
        name: r.name,
        color: r.color,
        amount,
        percentage:
          overallTotal > 0
            ? parseFloat(((amount / overallTotal) * 100).toFixed(2))
            : 0,
      };
    });
  }

  async getTrends(
    userId: string,
    startDate?: string,
    endDate?: string,
    period = 'daily',
  ) {
    const qb = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.userId = :userId', { userId })
      .andWhere('expense.isConfirmed = true');

    if (startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', { endDate });
    }

    if (period === 'monthly') {
      qb.select('TO_CHAR(expense.expenseDate, \'YYYY-MM\')', 'period')
        .addSelect('SUM(expense.amount)', 'total')
        .groupBy('TO_CHAR(expense.expenseDate, \'YYYY-MM\')')
        .orderBy('"period"', 'ASC');
    } else {
      qb.select('TO_CHAR(expense.expenseDate, \'YYYY-MM-DD\')', 'period')
        .addSelect('SUM(expense.amount)', 'total')
        .groupBy('TO_CHAR(expense.expenseDate, \'YYYY-MM-DD\')')
        .orderBy('"period"', 'ASC');
    }

    const rows = await qb.getRawMany();
    return rows.map((r) => ({
      period: r.period,
      total: parseFloat(r.total || '0'),
    }));
  }
}
