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
} from '../entities';
import { CurrencyCode, ExpenseSource } from '../../common/enums';

async function seedMonths() {
  console.log('Connecting to database to seed May - August 2026 data...');

  const dbUrl = process.env.DATABASE_URL;
  const isSsl = process.env.DATABASE_SSL === 'true' || !!dbUrl?.includes('sslmode=require');

  const dataSource = new DataSource({
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
    ],
  });

  await dataSource.initialize();
  console.log('Connected.');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const subcategoryRepo = dataSource.getRepository(Subcategory);
  const paymentMethodRepo = dataSource.getRepository(PaymentMethod);
  const budgetRepo = dataSource.getRepository(MonthlyBudget);
  const expenseRepo = dataSource.getRepository(Expense);
  const itemRepo = dataSource.getRepository(ExpenseItem);

  const user = await userRepo.findOne({ where: { email: 'user@khoroch.app' } });
  if (!user) {
    console.error('Demo user user@khoroch.app not found!');
    await dataSource.destroy();
    return;
  }

  const categories = await categoryRepo.find();
  const subcategories = await subcategoryRepo.find();
  const paymentMethods = await paymentMethodRepo.find();

  const getCat = (name: string) => categories.find((c) => c.name.toLowerCase().includes(name.toLowerCase())) || categories[0];
  const getSub = (catId: string, name: string) => subcategories.find((s) => s.categoryId === catId && s.name.toLowerCase().includes(name.toLowerCase()));
  const getPm = (name: string) => paymentMethods.find((p) => p.name.toLowerCase().includes(name.toLowerCase())) || paymentMethods[0];

  // Months configuration: 6 Months (March, April, May, June, July, August 2026)
  const monthsData = [
    {
      month: 3,
      year: 2026,
      budget: 62000,
      expenses: [
        { day: '01', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '03', cat: 'Food & Dining', sub: 'Groceries', pm: 'bKash', amount: 5200, desc: 'Shwapno Monthly Groceries', merchant: 'Shwapno Superstore', source: ExpenseSource.RECEIPT },
        { day: '06', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'Credit Card', amount: 450, desc: 'Uber Ride to Gulshan 1', merchant: 'Uber BD', source: ExpenseSource.VOICE },
        { day: '09', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 1950, desc: 'DESCO Winter Electricity Bill', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '12', cat: 'Food & Dining', sub: 'Restaurant', pm: 'Credit Card', amount: 1600, desc: 'Dinner at Secret Recipe', merchant: 'Secret Recipe', source: ExpenseSource.RECEIPT },
        { day: '15', cat: 'Shopping', sub: 'Clothing', pm: 'Credit Card', amount: 2800, desc: 'Spring Clothes & Denim', merchant: 'Sailor Dhanmondi', source: ExpenseSource.MANUAL },
        { day: '19', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2400, desc: 'Octane Car Fuel', merchant: 'Padma Oil Filling', source: ExpenseSource.MANUAL },
        { day: '23', cat: 'Health & Medical', sub: 'Medicine', pm: 'Cash', amount: 950, desc: 'Multivitamins & Omega-3', merchant: 'Labaid Pharmacy', source: ExpenseSource.MANUAL },
        { day: '27', cat: 'Entertainment', sub: 'Movies & Outings', pm: 'bKash', amount: 800, desc: 'Cineplex Movie Night', merchant: 'Star Cineplex', source: ExpenseSource.VOICE },
        { day: '30', cat: 'Bills & Subscriptions', sub: 'Internet Bill', pm: 'bKash', amount: 1200, desc: 'Fiber Broadband 50Mbps', merchant: 'Carnival Internet', source: ExpenseSource.MANUAL },
      ],
    },
    {
      month: 4,
      year: 2026,
      budget: 65000,
      expenses: [
        { day: '01', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '04', cat: 'Food & Dining', sub: 'Groceries', pm: 'Credit Card', amount: 5900, desc: 'Unimart Groceries & Dry Goods', merchant: 'Unimart Gulshan', source: ExpenseSource.RECEIPT },
        { day: '07', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'bKash', amount: 410, desc: 'Pathao Car Ride', merchant: 'Pathao', source: ExpenseSource.VOICE },
        { day: '10', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 2200, desc: 'DESCO Spring Electricity', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '13', cat: 'Food & Dining', sub: 'Restaurant', pm: 'Credit Card', amount: 2100, desc: 'Pohela Boishakh Feast', merchant: 'Kasturi Restaurant', source: ExpenseSource.RECEIPT },
        { day: '17', cat: 'Shopping', sub: 'Clothing', pm: 'Credit Card', amount: 4800, desc: 'Boishakhi Panjabi & Kurti', merchant: 'Aarong Dhanmondi', source: ExpenseSource.RECEIPT },
        { day: '21', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2500, desc: 'Car Fuel Refill', merchant: 'Trust Filling Station', source: ExpenseSource.MANUAL },
        { day: '25', cat: 'Health & Medical', sub: 'Doctor Consultation', pm: 'Cash', amount: 1500, desc: 'General Physician Checkup', merchant: 'Square Hospital', source: ExpenseSource.MANUAL },
        { day: '28', cat: 'Food & Dining', sub: 'Snacks & Beverages', pm: 'bKash', amount: 550, desc: 'Coffee & Cheesecake', merchant: 'North End Coffee', source: ExpenseSource.VOICE },
        { day: '30', cat: 'Bills & Subscriptions', sub: 'Internet Bill', pm: 'bKash', amount: 1200, desc: 'High Speed Fiber Bill', merchant: 'Carnival Internet', source: ExpenseSource.MANUAL },
      ],
    },
    {
      month: 5,
      year: 2026,
      budget: 65000,
      expenses: [
        { day: '02', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '04', cat: 'Food & Dining', sub: 'Groceries', pm: 'bKash', amount: 4850, desc: 'Monthly Grocery Stock', merchant: 'Shwapno Superstore', source: ExpenseSource.RECEIPT },
        { day: '07', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'Credit Card', amount: 480, desc: 'Uber Ride to Dhanmondi Office', merchant: 'Uber BD', source: ExpenseSource.VOICE },
        { day: '10', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 2350, desc: 'DESCO Electricity Bill', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '12', cat: 'Food & Dining', sub: 'Restaurant', pm: 'Credit Card', amount: 1850, desc: 'Dinner with Colleagues', merchant: 'Takeout Dhanmondi', source: ExpenseSource.RECEIPT },
        { day: '15', cat: 'Health & Medical', sub: 'Medicine', pm: 'Cash', amount: 1200, desc: 'Prescription Vitamins & Allergy Meds', merchant: 'Labaid Pharmacy', source: ExpenseSource.MANUAL },
        { day: '18', cat: 'Shopping', sub: 'Clothing', pm: 'Credit Card', amount: 3400, desc: 'Casual Shirts & Polo', merchant: 'Aarong Uttara', source: ExpenseSource.MANUAL },
        { day: '21', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2500, desc: 'Octane Refill for Car', merchant: 'Padma Oil Filling', source: ExpenseSource.MANUAL },
        { day: '24', cat: 'Entertainment', sub: 'Movies & Outings', pm: 'bKash', amount: 950, desc: 'Star Cineplex Movie Tickets', merchant: 'Star Cineplex', source: ExpenseSource.VOICE },
        { day: '27', cat: 'Food & Dining', sub: 'Groceries', pm: 'Cash', amount: 1650, desc: 'Fresh Fruits and Fish', merchant: 'Karwan Bazar', source: ExpenseSource.MANUAL },
        { day: '30', cat: 'Bills & Subscriptions', sub: 'Internet Bill', pm: 'bKash', amount: 1200, desc: 'Fiber Broadband 50Mbps', merchant: 'Carnival Internet', source: ExpenseSource.MANUAL },
      ],
    },
    {
      month: 6,
      year: 2026,
      budget: 70000,
      expenses: [
        { day: '01', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '03', cat: 'Food & Dining', sub: 'Groceries', pm: 'Credit Card', amount: 5600, desc: 'Unimart Groceries & Toiletries', merchant: 'Unimart Gulshan', source: ExpenseSource.RECEIPT },
        { day: '06', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'bKash', amount: 380, desc: 'Pathao Car to Banani', merchant: 'Pathao', source: ExpenseSource.VOICE },
        { day: '09', cat: 'Education', sub: 'Books & Stationery', pm: 'Cash', amount: 1450, desc: 'Programming & Finance Books', merchant: 'Nilkhet Book Market', source: ExpenseSource.MANUAL },
        { day: '12', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 2800, desc: 'DESCO AC Electricity Bill', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '15', cat: 'Food & Dining', sub: 'Restaurant', pm: 'Credit Card', amount: 2400, desc: 'Family Buffet Dinner', merchant: 'The Great Kabab Factory', source: ExpenseSource.RECEIPT },
        { day: '18', cat: 'Shopping', sub: 'Electronics', pm: 'Credit Card', amount: 4500, desc: 'Wireless Mechanical Keyboard', merchant: 'Ryans Computers', source: ExpenseSource.MANUAL },
        { day: '21', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2600, desc: 'Car Fuel Tank Fill', merchant: 'Trust Filling Station', source: ExpenseSource.MANUAL },
        { day: '24', cat: 'Health & Medical', sub: 'Doctor Consultation', pm: 'Cash', amount: 2000, desc: 'Dentist Checkup & Scaling', merchant: 'Popular Diagnostic', source: ExpenseSource.MANUAL },
        { day: '27', cat: 'Food & Dining', sub: 'Snacks & Beverages', pm: 'bKash', amount: 650, desc: 'North End Coffee & Pastries', merchant: 'North End Coffee Roasters', source: ExpenseSource.VOICE },
        { day: '29', cat: 'Bills & Subscriptions', sub: 'Mobile Recharge', pm: 'bKash', amount: 799, desc: 'GP Monthly Internet Pack', merchant: 'Grameenphone', source: ExpenseSource.MANUAL },
      ],
    },
    {
      month: 7,
      year: 2026,
      budget: 68000,
      expenses: [
        { day: '01', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '04', cat: 'Food & Dining', sub: 'Groceries', pm: 'Credit Card', amount: 6100, desc: 'Meena Bazar Weekly Groceries', merchant: 'Meena Bazar', source: ExpenseSource.RECEIPT },
        { day: '08', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'bKash', amount: 520, desc: 'Uber Ride to Airport', merchant: 'Uber BD', source: ExpenseSource.VOICE },
        { day: '11', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 3100, desc: 'Summer Electricity Bill', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '14', cat: 'Shopping', sub: 'Clothing', pm: 'Credit Card', amount: 5200, desc: 'Eid Shopping & Shoes', merchant: 'Apex Footwear', source: ExpenseSource.RECEIPT },
        { day: '17', cat: 'Food & Dining', sub: 'Restaurant', pm: 'bKash', amount: 1750, desc: 'KFC Zinger Burgers & Krushers', merchant: 'KFC Gulshan', source: ExpenseSource.RECEIPT },
        { day: '20', cat: 'Entertainment', sub: 'Games & Events', pm: 'Credit Card', amount: 1200, desc: 'Steam Summer Sale Games', merchant: 'Steam / Valve', source: ExpenseSource.MANUAL },
        { day: '23', cat: 'Health & Medical', sub: 'Medicine', pm: 'Cash', amount: 850, desc: 'Routine Medicine & Bandages', merchant: 'Tamanna Pharmacy', source: ExpenseSource.MANUAL },
        { day: '26', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2500, desc: 'Fuel Refill', merchant: 'Meghna Petroleum', source: ExpenseSource.MANUAL },
        { day: '29', cat: 'Bills & Subscriptions', sub: 'Internet Bill', pm: 'bKash', amount: 1200, desc: 'Broadband Monthly Bill', merchant: 'Carnival Internet', source: ExpenseSource.MANUAL },
      ],
    },
    {
      month: 8,
      year: 2026,
      budget: 75000,
      expenses: [
        { day: '01', cat: 'Housing', sub: 'Rent', pm: 'Bank Transfer', amount: 22000, desc: 'Apartment Monthly Rent', merchant: 'Landlord', source: ExpenseSource.MANUAL },
        { day: '03', cat: 'Food & Dining', sub: 'Groceries', pm: 'Credit Card', amount: 5850, desc: 'Shwapno Household Groceries', merchant: 'Shwapno Superstore', source: ExpenseSource.RECEIPT },
        { day: '05', cat: 'Transportation', sub: 'Ride Sharing (Uber/Pathao)', pm: 'bKash', amount: 460, desc: 'Uber Ride to Gulshan Meeting', merchant: 'Uber BD', source: ExpenseSource.VOICE },
        { day: '07', cat: 'Food & Dining', sub: 'Restaurant', pm: 'Credit Card', amount: 1950, desc: 'Weekend Lunch with Family', merchant: 'Madchef Dhanmondi', source: ExpenseSource.RECEIPT },
        { day: '09', cat: 'Bills & Subscriptions', sub: 'Electricity Bill', pm: 'bKash', amount: 2900, desc: 'DESCO Monthly Electric Bill', merchant: 'DESCO', source: ExpenseSource.MANUAL },
        { day: '11', cat: 'Health & Medical', sub: 'Doctor Consultation', pm: 'Credit Card', amount: 1500, desc: 'Eye Specialist Checkup', merchant: 'Ispahani Islamia Eye Hospital', source: ExpenseSource.MANUAL },
        { day: '13', cat: 'Shopping', sub: 'Electronics', pm: 'Credit Card', amount: 3200, desc: 'Fast GaN Charger & Cable', merchant: 'Gadget & Gear', source: ExpenseSource.MANUAL },
        { day: '14', cat: 'Transportation', sub: 'Fuel', pm: 'Debit Card', amount: 2600, desc: 'Car Fuel Octane', merchant: 'Trust Filling Station', source: ExpenseSource.MANUAL },
        { day: '15', cat: 'Food & Dining', sub: 'Snacks & Beverages', pm: 'bKash', amount: 420, desc: 'Evening Snacks & Tea', merchant: 'Cha & Co', source: ExpenseSource.VOICE },
        { day: '16', cat: 'Bills & Subscriptions', sub: 'Internet Bill', pm: 'bKash', amount: 1200, desc: 'High Speed Fiber Bill', merchant: 'Carnival Internet', source: ExpenseSource.MANUAL },
      ],
    },
  ];

  for (const m of monthsData) {
    console.log(`Processing Month ${m.month}/${m.year}...`);

    // 1. Create or update MonthlyBudget
    let budget = await budgetRepo.findOne({
      where: { userId: user.id, month: m.month, year: m.year },
    });

    if (!budget) {
      budget = budgetRepo.create({
        userId: user.id,
        month: m.month,
        year: m.year,
        startingBalance: m.budget,
        currency: CurrencyCode.BDT,
      });
    } else {
      budget.startingBalance = m.budget;
    }
    budget = await budgetRepo.save(budget);

    // 2. Clear old demo expenses for that month if any to avoid duplicates
    const startStr = `${m.year}-${String(m.month).padStart(2, '0')}-01`;
    const endStr = `${m.year}-${String(m.month).padStart(2, '0')}-31`;
    const existing = await expenseRepo.find({
      where: {
        userId: user.id,
      },
    });
    for (const exp of existing) {
      if (exp.expenseDate >= startStr && exp.expenseDate <= endStr) {
        await itemRepo.delete({ expenseId: exp.id });
        await expenseRepo.remove(exp);
      }
    }

    // 3. Create expenses for the month
    for (const item of m.expenses) {
      const cat = getCat(item.cat);
      const sub = getSub(cat.id, item.sub);
      const pm = getPm(item.pm);
      const dateStr = `${m.year}-${String(m.month).padStart(2, '0')}-${item.day}`;

      const expense = expenseRepo.create({
        userId: user.id,
        monthlyBudgetId: budget.id,
        categoryId: cat.id,
        subcategoryId: sub?.id || null,
        paymentMethodId: pm?.id || null,
        amount: item.amount,
        currency: CurrencyCode.BDT,
        description: item.desc,
        merchant: item.merchant,
        notes: `Expense for ${item.desc}`,
        expenseDate: dateStr,
        expenseTime: '14:30:00',
        source: item.source,
        isConfirmed: true,
      });

      const saved = await expenseRepo.save(expense);

      // Create item details for receipts
      if (item.source === ExpenseSource.RECEIPT) {
        await itemRepo.save([
          itemRepo.create({
            expenseId: saved.id,
            name: `${item.desc} - Item 1`,
            quantity: 1,
            unitPrice: Math.round(item.amount * 0.6),
            totalPrice: Math.round(item.amount * 0.6),
            sortOrder: 1,
          }),
          itemRepo.create({
            expenseId: saved.id,
            name: `${item.desc} - Item 2`,
            quantity: 2,
            unitPrice: Math.round(item.amount * 0.2),
            totalPrice: Math.round(item.amount * 0.4),
            sortOrder: 2,
          }),
        ]);
      }
    }
  }

  console.log('✅ Successfully seeded May - August 2026 expense data!');
  await dataSource.destroy();
}

seedMonths().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
