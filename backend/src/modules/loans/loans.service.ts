import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan, LoanType, LoanStatus } from '@/database/entities';
import { CreateLoanDto, UpdateLoanDto, LoanQueryDto } from './dto/loans.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(userId: string, dto: CreateLoanDto): Promise<Loan> {
    const loan = this.loanRepository.create({
      userId,
      type: dto.type,
      personName: dto.personName,
      amount: Number(dto.amount),
      transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date(),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      notes: dto.notes,
      status: LoanStatus.PENDING,
    });

    return await this.loanRepository.save(loan);
  }

  async findAll(userId: string, query: LoanQueryDto): Promise<Loan[]> {
    const qb = this.loanRepository
      .createQueryBuilder('loan')
      .where('loan.user_id = :userId', { userId })
      .orderBy('loan.transaction_date', 'DESC');

    if (query.type) {
      qb.andWhere('loan.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('loan.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(LOWER(loan.person_name) LIKE :search OR LOWER(loan.notes) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    return await qb.getMany();
  }

  async findOne(userId: string, id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id, userId },
    });
    if (!loan) {
      throw new NotFoundException(`Loan record with ID "${id}" not found`);
    }
    return loan;
  }

  async update(userId: string, id: string, dto: UpdateLoanDto): Promise<Loan> {
    const loan = await this.findOne(userId, id);

    if (dto.personName !== undefined) loan.personName = dto.personName;
    if (dto.amount !== undefined) loan.amount = Number(dto.amount);
    if (dto.dueDate !== undefined) loan.dueDate = dto.dueDate ? new Date(dto.dueDate) : (null as any);
    if (dto.notes !== undefined) loan.notes = dto.notes;
    if (dto.status !== undefined) {
      loan.status = dto.status;
      if (dto.status === LoanStatus.SETTLED) {
        loan.settledAt = new Date();
      } else {
        loan.settledAt = null as any;
      }
    }

    return await this.loanRepository.save(loan);
  }

  async settle(userId: string, id: string): Promise<Loan> {
    const loan = await this.findOne(userId, id);

    if (loan.status === LoanStatus.SETTLED) {
      loan.status = LoanStatus.PENDING;
      loan.settledAt = null as any;
    } else {
      loan.status = LoanStatus.SETTLED;
      loan.settledAt = new Date();
    }

    return await this.loanRepository.save(loan);
  }

  async remove(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    const loan = await this.findOne(userId, id);
    await this.loanRepository.remove(loan);
    return { success: true, message: 'Loan record removed successfully' };
  }

  async getSummary(userId: string) {
    const loans = await this.loanRepository.find({
      where: { userId },
    });

    let totalLentPending = 0;
    let totalBorrowedPending = 0;
    let totalLentSettled = 0;
    let totalBorrowedSettled = 0;

    for (const loan of loans) {
      const amt = Number(loan.amount) || 0;
      if (loan.type === LoanType.LEND) {
        if (loan.status === LoanStatus.PENDING) {
          totalLentPending += amt;
        } else {
          totalLentSettled += amt;
        }
      } else if (loan.type === LoanType.BORROW) {
        if (loan.status === LoanStatus.PENDING) {
          totalBorrowedPending += amt;
        } else {
          totalBorrowedSettled += amt;
        }
      }
    }

    // Net balance effect:
    // When you borrow pending: +money to your pocket
    // When you lend pending: -money from your pocket
    const netPending = totalBorrowedPending - totalLentPending;

    return {
      totalLentPending,
      totalBorrowedPending,
      totalLentSettled,
      totalBorrowedSettled,
      netPending,
      totalRecords: loans.length,
      pendingCount: loans.filter((l) => l.status === LoanStatus.PENDING).length,
      settledCount: loans.filter((l) => l.status === LoanStatus.SETTLED).length,
    };
  }
}
