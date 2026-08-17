import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, Category, Expense } from '@/database/entities';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionQueryDto } from './dto/subscriptions.dto';
import { ExpensesService } from '@/modules/expenses/expenses.service';
import { ExpenseSource } from '@/common/enums';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private expensesService: ExpensesService,
  ) {}

  async findAll(userId: string, query: SubscriptionQueryDto) {
    const qb = this.subscriptionRepository
      .createQueryBuilder('sub')
      .where('sub.userId = :userId', { userId });

    if (query.month) {
      qb.andWhere('sub.billingMonth = :month', { month: query.month });
    }

    if (query.status) {
      qb.andWhere('sub.status = :status', { status: query.status });
    }

    if (query.search) {
      const q = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(sub.serviceName) LIKE :q OR LOWER(sub.category) LIKE :q OR LOWER(sub.notes) LIKE :q)',
        { q },
      );
    }

    qb.orderBy('sub.status', 'ASC')
      .addOrderBy('sub.renewalDate', 'ASC')
      .addOrderBy('sub.createdAt', 'DESC');

    const items = await qb.getMany();

    // Summary calculation
    let totalSubsAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    for (const s of items) {
      const amt = Number(s.amount) || 0;
      totalSubsAmount += amt;
      if (s.status === SubscriptionStatus.PAID) {
        paidAmount += amt;
        paidCount++;
      } else {
        unpaidAmount += amt;
        unpaidCount++;
      }
    }

    return {
      items,
      summary: {
        totalSubsAmount,
        paidAmount,
        unpaidAmount,
        paidCount,
        unpaidCount,
        totalCount: items.length,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findOne({
      where: { id, userId },
    });
    if (!sub) {
      throw new NotFoundException('Subscription record not found');
    }
    return sub;
  }

  async create(userId: string, dto: CreateSubscriptionDto): Promise<Subscription> {
    const currentMonth = dto.billingMonth || new Date().toISOString().slice(0, 7);
    const sub = this.subscriptionRepository.create({
      userId,
      serviceName: dto.serviceName,
      category: dto.category || 'Entertainment',
      amount: dto.amount,
      billingMonth: currentMonth,
      billingCycle: dto.billingCycle,
      renewalDate: dto.renewalDate || null as any,
      notes: dto.notes || null as any,
      status: SubscriptionStatus.UNPAID,
    });

    return await this.subscriptionRepository.save(sub);
  }

  async update(userId: string, id: string, dto: UpdateSubscriptionDto): Promise<Subscription> {
    const sub = await this.findOne(userId, id);

    if (dto.serviceName !== undefined) sub.serviceName = dto.serviceName;
    if (dto.category !== undefined) sub.category = dto.category;
    if (dto.amount !== undefined) sub.amount = dto.amount;
    if (dto.billingMonth !== undefined) sub.billingMonth = dto.billingMonth;
    if (dto.billingCycle !== undefined) sub.billingCycle = dto.billingCycle;
    if (dto.renewalDate !== undefined) sub.renewalDate = dto.renewalDate as any;
    if (dto.notes !== undefined) sub.notes = dto.notes as any;
    if (dto.status !== undefined) sub.status = dto.status;

    return await this.subscriptionRepository.save(sub);
  }

  async togglePay(userId: string, id: string): Promise<{ subscription: Subscription; expenseCreated?: boolean }> {
    const sub = await this.findOne(userId, id);

    if (sub.status === SubscriptionStatus.PAID) {
      sub.status = SubscriptionStatus.UNPAID;
      sub.paidAt = null as any;
      const savedSub = await this.subscriptionRepository.save(sub);
      return { subscription: savedSub, expenseCreated: false };
    }

    sub.status = SubscriptionStatus.PAID;
    sub.paidAt = new Date();

    // Match or find entertainment / software / subscriptions category
    const categories = await this.categoryRepository.find({ where: { isEnabled: true } });
    let matchedCat = categories.find((c) => /entertain|subscript|software|online|internet/i.test(c.name));
    if (!matchedCat) {
      matchedCat = categories[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const createdExpense = await this.expensesService.create(
      userId,
      {
        amount: Number(sub.amount),
        currency: 'BDT' as any,
        categoryId: matchedCat?.id || categories[0]?.id,
        description: `Subscription: ${sub.serviceName} (${sub.category})`,
        merchant: sub.serviceName,
        expenseDate: todayStr,
        notes: `Subscription paid for month ${sub.billingMonth}. Notes: ${sub.notes || 'None'}`,
      },
      ExpenseSource.MANUAL,
    );

    sub.expenseId = createdExpense.id;
    const savedSub = await this.subscriptionRepository.save(sub);

    return { subscription: savedSub, expenseCreated: true };
  }

  async remove(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    const sub = await this.findOne(userId, id);
    await this.subscriptionRepository.remove(sub);
    return { success: true, message: 'Subscription removed' };
  }
}
