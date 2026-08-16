import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { DataSource } from 'typeorm';
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
  LoanType,
  LoanStatus,
} from '../entities';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'defaultdb',
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
  synchronize: true,
});

async function seedLoans() {
  console.log('🌱 Connecting to database to seed Dhar Dena (Loans)...');
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const loanRepository = AppDataSource.getRepository(Loan);

  const users = await userRepository.find();
  if (users.length === 0) {
    console.log('❌ No users found in database. Run main seed first.');
    await AppDataSource.destroy();
    return;
  }

  console.log(`Found ${users.length} user(s). Seeding Dhar / Dena for each user...`);

  for (const user of users) {
    // Check existing loans
    const existingLoans = await loanRepository.count({ where: { userId: user.id } });
    if (existingLoans > 0) {
      console.log(`User ${user.email} already has ${existingLoans} loans. Cleaning up for fresh seed...`);
      await loanRepository.delete({ userId: user.id });
    }

    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const sampleLoans = [
      // 1. Lent (Receivable - Active / Pending)
      {
        userId: user.id,
        type: LoanType.LEND,
        personName: 'Tanvir Ahmed',
        amount: 5000,
        transactionDate: fiveDaysAgo,
        dueDate: nextTwoWeeks,
        status: LoanStatus.PENDING,
        notes: 'Emergency hospital medicine bill advance, will return by month end',
      },
      {
        userId: user.id,
        type: LoanType.LEND,
        personName: 'Sakib Hasan (Friend)',
        amount: 2500,
        transactionDate: twoDaysAgo,
        dueDate: inThreeDays,
        status: LoanStatus.PENDING,
        notes: 'Restaurant group dinner bill paid on bKash',
      },
      {
        userId: user.id,
        type: LoanType.LEND,
        personName: 'Rahim Chowdhury',
        amount: 12000,
        transactionDate: oneWeekAgo,
        dueDate: nextWeek,
        status: LoanStatus.PENDING,
        notes: 'Laptop repair fee loan',
      },
      // 2. Borrowed (Payable - Active / Pending)
      {
        userId: user.id,
        type: LoanType.BORROW,
        personName: 'Arifur Rahman (Colleague)',
        amount: 3000,
        transactionDate: threeDaysAgo(now),
        dueDate: inThreeDays,
        status: LoanStatus.PENDING,
        notes: 'Borrowed cash at ATM during shopping shortage',
      },
      {
        userId: user.id,
        type: LoanType.BORROW,
        personName: 'Shuvo (Roommate)',
        amount: 1800,
        transactionDate: twoDaysAgo,
        dueDate: nextWeek,
        status: LoanStatus.PENDING,
        notes: 'Flat wifi and electricity bill share payable',
      },
      {
        userId: user.id,
        type: LoanType.BORROW,
        personName: 'Kamrul Bhai',
        amount: 7500,
        transactionDate: tenDaysAgo,
        dueDate: nextTwoWeeks,
        status: LoanStatus.PENDING,
        notes: 'Urgent home appliance repair borrowing',
      },
      // 3. Settled / Paid Back History
      {
        userId: user.id,
        type: LoanType.LEND,
        personName: 'Nabil Rayhan',
        amount: 1500,
        transactionDate: twoWeeksAgo,
        dueDate: oneWeekAgo,
        status: LoanStatus.SETTLED,
        settledAt: twoDaysAgo,
        notes: 'Movie tickets and snacks, paid back via bKash',
      },
      {
        userId: user.id,
        type: LoanType.LEND,
        personName: 'Farhan Karim',
        amount: 4000,
        transactionDate: twoWeeksAgo,
        dueDate: oneWeekAgo,
        status: LoanStatus.SETTLED,
        settledAt: oneWeekAgo,
        notes: 'Tour resort advance payment, paid back in cash',
      },
      {
        userId: user.id,
        type: LoanType.BORROW,
        personName: 'Mahir Hossain',
        amount: 5000,
        transactionDate: twoWeeksAgo,
        dueDate: oneWeekAgo,
        status: LoanStatus.SETTLED,
        settledAt: fiveDaysAgo,
        notes: 'Short term borrow for car maintenance, paid back',
      },
    ];

    for (const item of sampleLoans) {
      const loan = loanRepository.create(item);
      await loanRepository.save(loan);
    }

    console.log(`✅ Seeded ${sampleLoans.length} Dhar / Dena records for ${user.email}`);
  }

  await AppDataSource.destroy();
  console.log('🎉 Dhar Dena seeding completed successfully!');
}

function threeDaysAgo(date: Date) {
  return new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000);
}

seedLoans().catch((err) => {
  console.error('❌ Error seeding loans:', err);
  process.exit(1);
});
