import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Expense,
  ExpenseItem,
  Receipt,
  AiProcessingLog,
} from '@/database/entities';
import { BudgetsService } from '@/modules/budgets/budgets.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  BatchConfirmExpensesDto,
  ExpenseQueryDto,
} from './dto/expense.dto';
import { ExpenseSource } from '@/common/enums';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseItem)
    private expenseItemRepository: Repository<ExpenseItem>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(AiProcessingLog)
    private aiLogRepository: Repository<AiProcessingLog>,
    private budgetsService: BudgetsService,
  ) {}

  async findAll(userId: string, query: ExpenseQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const qb = this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.category', 'category')
      .leftJoinAndSelect('expense.subcategory', 'subcategory')
      .leftJoinAndSelect('expense.paymentMethod', 'paymentMethod')
      .where('expense.userId = :userId', { userId });

    if (query.isConfirmed !== undefined) {
      const isConfirmed = query.isConfirmed === 'true' || (query.isConfirmed as any) === true;
      qb.andWhere('expense.isConfirmed = :isConfirmed', { isConfirmed });
    }

    if (query.month && query.year) {
      qb.andWhere('EXTRACT(MONTH FROM expense.expenseDate) = :month', {
        month: query.month,
      });
      qb.andWhere('EXTRACT(YEAR FROM expense.expenseDate) = :year', {
        year: query.year,
      });
    }

    if (query.startDate) {
      qb.andWhere('expense.expenseDate >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('expense.expenseDate <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.categoryId) {
      qb.andWhere('expense.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    if (query.paymentMethodId) {
      qb.andWhere('expense.paymentMethodId = :paymentMethodId', {
        paymentMethodId: query.paymentMethodId,
      });
    }

    if (query.source) {
      qb.andWhere('expense.source = :source', { source: query.source });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(expense.description) LIKE :search OR LOWER(expense.merchant) LIKE :search OR LOWER(expense.notes) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const sortField =
      query.sortBy === 'amount'
        ? 'expense.amount'
        : query.sortBy === 'createdAt'
          ? 'expense.createdAt'
          : 'expense.expenseDate';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(sortField, sortOrder).addOrderBy('expense.createdAt', 'DESC');

    const [items, totalItems] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit) || 1,
        currentPage: page,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
      relations: [
        'category',
        'subcategory',
        'paymentMethod',
        'items',
        'receipt',
      ],
    });

    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    return expense;
  }

  async create(userId: string, createExpenseDto: CreateExpenseDto, source = ExpenseSource.MANUAL) {
    const budget = await this.budgetsService.findOrCreateBudgetForDate(
      userId,
      createExpenseDto.expenseDate,
    );

    const expense = this.expenseRepository.create({
      userId,
      monthlyBudgetId: budget.id,
      categoryId: createExpenseDto.categoryId,
      subcategoryId: createExpenseDto.subcategoryId,
      paymentMethodId: createExpenseDto.paymentMethodId,
      amount: createExpenseDto.amount,
      currency: createExpenseDto.currency,
      description: createExpenseDto.description,
      merchant: createExpenseDto.merchant,
      notes: createExpenseDto.notes,
      expenseDate: createExpenseDto.expenseDate,
      expenseTime: createExpenseDto.expenseTime,
      source,
      isConfirmed: true,
    });

    const savedExpense = await this.expenseRepository.save(expense);

    if (createExpenseDto.items && createExpenseDto.items.length > 0) {
      const items = createExpenseDto.items.map((item, index) =>
        this.expenseItemRepository.create({
          expenseId: savedExpense.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: item.sortOrder ?? index,
        }),
      );
      await this.expenseItemRepository.save(items);
    }

    return await this.findOne(userId, savedExpense.id);
  }

  async batchConfirm(userId: string, dto: BatchConfirmExpensesDto) {
    if (!dto.expenses || dto.expenses.length === 0) {
      throw new BadRequestException('No expenses provided for confirmation');
    }

    const createdExpenses: Expense[] = [];

    for (const expDto of dto.expenses) {
      const budget = await this.budgetsService.findOrCreateBudgetForDate(
        userId,
        expDto.expenseDate,
      );

      const expense = this.expenseRepository.create({
        userId,
        monthlyBudgetId: budget.id,
        categoryId: expDto.categoryId,
        subcategoryId: expDto.subcategoryId,
        paymentMethodId: expDto.paymentMethodId,
        amount: expDto.amount,
        currency: expDto.currency,
        description: expDto.description,
        merchant: expDto.merchant,
        notes: expDto.notes,
        expenseDate: expDto.expenseDate,
        expenseTime: expDto.expenseTime,
        source: dto.source,
        isConfirmed: true,
      });

      const savedExpense = await this.expenseRepository.save(expense);

      if (expDto.items && expDto.items.length > 0) {
        const items = expDto.items.map((item, index) =>
          this.expenseItemRepository.create({
            expenseId: savedExpense.id,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            sortOrder: item.sortOrder ?? index,
          }),
        );
        await this.expenseItemRepository.save(items);
      }

      if (dto.receiptId) {
        await this.receiptRepository.update(
          { id: dto.receiptId, userId },
          { expenseId: savedExpense.id },
        );
      }

      createdExpenses.push(savedExpense);
    }

    // Update AI log audit record if provided
    if (dto.aiLogId) {
      await this.aiLogRepository.update(
        { id: dto.aiLogId, userId },
        {
          wasConfirmed: true,
          expensesCreated: createdExpenses.length,
        },
      );
    }

    return createdExpenses;
  }

  async update(userId: string, id: string, updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
    });
    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    if (updateExpenseDto.expenseDate && updateExpenseDto.expenseDate !== expense.expenseDate) {
      const budget = await this.budgetsService.findOrCreateBudgetForDate(
        userId,
        updateExpenseDto.expenseDate,
      );
      expense.monthlyBudgetId = budget.id;
    }

    Object.assign(expense, updateExpenseDto);
    await this.expenseRepository.save(expense);

    if (updateExpenseDto.items) {
      await this.expenseItemRepository.delete({ expenseId: id });
      const items = updateExpenseDto.items.map((item, index) =>
        this.expenseItemRepository.create({
          expenseId: id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          sortOrder: item.sortOrder ?? index,
        }),
      );
      await this.expenseItemRepository.save(items);
    }

    return await this.findOne(userId, id);
  }

  async remove(userId: string, id: string) {
    const expense = await this.expenseRepository.findOne({
      where: { id, userId },
    });
    if (!expense) {
      throw new NotFoundException('Expense record not found');
    }

    await this.expenseRepository.remove(expense);
    return { message: 'Expense deleted successfully' };
  }
}
