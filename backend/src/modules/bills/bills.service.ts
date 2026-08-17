import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UtilityBill, BillStatus, Category, Expense } from '@/database/entities';
import { CreateBillDto, UpdateBillDto, BillQueryDto } from './dto/bills.dto';
import { ExpensesService } from '@/modules/expenses/expenses.service';
import { ExpenseSource } from '@/common/enums';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(UtilityBill)
    private billRepository: Repository<UtilityBill>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private expensesService: ExpensesService,
  ) {}

  async findAll(userId: string, query: BillQueryDto) {
    const qb = this.billRepository
      .createQueryBuilder('bill')
      .where('bill.userId = :userId', { userId });

    if (query.month) {
      qb.andWhere('bill.billingMonth = :month', { month: query.month });
    }

    if (query.status) {
      qb.andWhere('bill.status = :status', { status: query.status });
    }

    if (query.search) {
      const q = `%${query.search.toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(bill.receiverName) LIKE :q OR LOWER(bill.category) LIKE :q OR LOWER(bill.notes) LIKE :q)',
        { q },
      );
    }

    qb.orderBy('bill.status', 'ASC') // unpaid first
      .addOrderBy('bill.dueDate', 'ASC')
      .addOrderBy('bill.createdAt', 'DESC');

    const items = await qb.getMany();

    // Summary calculation
    let totalBillsAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    for (const b of items) {
      const amt = Number(b.amount) || 0;
      totalBillsAmount += amt;
      if (b.status === BillStatus.PAID) {
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
        totalBillsAmount,
        paidAmount,
        unpaidAmount,
        paidCount,
        unpaidCount,
        totalCount: items.length,
      },
    };
  }

  async findOne(userId: string, id: string): Promise<UtilityBill> {
    const bill = await this.billRepository.findOne({
      where: { id, userId },
    });
    if (!bill) {
      throw new NotFoundException('Utility bill record not found');
    }
    return bill;
  }

  async create(userId: string, dto: CreateBillDto): Promise<UtilityBill> {
    const currentMonth = dto.billingMonth || new Date().toISOString().slice(0, 7);
    const bill = this.billRepository.create({
      userId,
      receiverName: dto.receiverName,
      category: dto.category || 'Utilities',
      amount: dto.amount,
      billingMonth: currentMonth,
      dueDate: dto.dueDate || null as any,
      notes: dto.notes || null as any,
      status: BillStatus.UNPAID,
    });

    return await this.billRepository.save(bill);
  }

  async update(userId: string, id: string, dto: UpdateBillDto): Promise<UtilityBill> {
    const bill = await this.findOne(userId, id);

    if (dto.receiverName !== undefined) bill.receiverName = dto.receiverName;
    if (dto.category !== undefined) bill.category = dto.category;
    if (dto.amount !== undefined) bill.amount = dto.amount;
    if (dto.billingMonth !== undefined) bill.billingMonth = dto.billingMonth;
    if (dto.dueDate !== undefined) bill.dueDate = dto.dueDate as any;
    if (dto.notes !== undefined) bill.notes = dto.notes as any;
    if (dto.status !== undefined) bill.status = dto.status;

    return await this.billRepository.save(bill);
  }

  async togglePay(userId: string, id: string): Promise<{ bill: UtilityBill; expenseCreated?: boolean }> {
    const bill = await this.findOne(userId, id);

    if (bill.status === BillStatus.PAID) {
      // Reverting to unpaid
      bill.status = BillStatus.UNPAID;
      bill.paidAt = null as any;
      const savedBill = await this.billRepository.save(bill);
      return { bill: savedBill, expenseCreated: false };
    }

    // Marking as PAID -> automatically create confirmed expense to deduct balance
    bill.status = BillStatus.PAID;
    bill.paidAt = new Date();

    // Match or find utilities category
    const categories = await this.categoryRepository.find({ where: { isEnabled: true } });
    let matchedCat = categories.find((c) => /utilit|bill|কারেন্ট|বিদ্যুৎ|গ্যাস|পানি/i.test(c.name));
    if (!matchedCat) {
      matchedCat = categories[0];
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const createdExpense = await this.expensesService.create(
      userId,
      {
        amount: Number(bill.amount),
        currency: 'BDT' as any,
        categoryId: matchedCat?.id || categories[0]?.id,
        description: `Bill Payment: ${bill.receiverName} (${bill.category})`,
        merchant: bill.receiverName,
        expenseDate: todayStr,
        notes: `Paid utility bill for month ${bill.billingMonth}. Notes: ${bill.notes || 'None'}`,
      },
      ExpenseSource.MANUAL,
    );

    bill.expenseId = createdExpense.id;
    const savedBill = await this.billRepository.save(bill);

    return { bill: savedBill, expenseCreated: true };
  }

  async remove(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    const bill = await this.findOne(userId, id);
    await this.billRepository.remove(bill);
    return { success: true, message: 'Utility bill removed' };
  }
}
