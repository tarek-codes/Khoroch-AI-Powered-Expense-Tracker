import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
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
import { UserRole, CurrencyCode } from '../../common/enums';

const DEFAULT_CATEGORIES = [
  {
    name: 'Food & Dining',
    nameBn: 'খাবার ও রেস্তোরাঁ',
    icon: 'utensils',
    color: '#FF6B6B',
    isDefault: true,
    sortOrder: 1,
    subcategories: [
      { name: 'Groceries', nameBn: 'মুদি সামগ্রী', sortOrder: 1 },
      { name: 'Restaurant', nameBn: 'রেস্তোরাঁ', sortOrder: 2 },
      { name: 'Snacks & Beverages', nameBn: 'নাস্তা ও পানীয়', sortOrder: 3 },
    ],
  },
  {
    name: 'Transportation',
    nameBn: 'যাতায়াত',
    icon: 'car',
    color: '#4ECDC4',
    isDefault: true,
    sortOrder: 2,
    subcategories: [
      { name: 'Rickshaw', nameBn: 'রিকশা', sortOrder: 1 },
      { name: 'Bus', nameBn: 'বাস', sortOrder: 2 },
      { name: 'Ride Sharing (Uber/Pathao)', nameBn: 'রাইড শেয়ারিং', sortOrder: 3 },
      { name: 'Fuel', nameBn: 'জ্বালানী', sortOrder: 4 },
    ],
  },
  {
    name: 'Housing',
    nameBn: 'বাসস্থান',
    icon: 'home',
    color: '#45B7D1',
    isDefault: true,
    sortOrder: 3,
    subcategories: [
      { name: 'Rent', nameBn: 'বাড়ি ভাড়া', sortOrder: 1 },
      { name: 'Maintenance', nameBn: 'রক্ষণাবেক্ষণ', sortOrder: 2 },
    ],
  },
  {
    name: 'Shopping',
    nameBn: 'কেনাকাটা',
    icon: 'shopping-bag',
    color: '#96CEB4',
    isDefault: true,
    sortOrder: 4,
    subcategories: [
      { name: 'Clothing', nameBn: 'পোশাক', sortOrder: 1 },
      { name: 'Electronics', nameBn: 'ইলেকট্রনিক্স', sortOrder: 2 },
    ],
  },
  {
    name: 'Health & Medical',
    nameBn: 'স্বাস্থ্য ও চিকিৎসা',
    icon: 'heart-pulse',
    color: '#FF8A80',
    isDefault: true,
    sortOrder: 5,
    subcategories: [
      { name: 'Medicine', nameBn: 'ওষুধ', sortOrder: 1 },
      { name: 'Doctor Consultation', nameBn: 'ডাক্তার ফি', sortOrder: 2 },
    ],
  },
  {
    name: 'Education',
    nameBn: 'শিক্ষা',
    icon: 'graduation-cap',
    color: '#7C4DFF',
    isDefault: true,
    sortOrder: 6,
    subcategories: [
      { name: 'Tuition Fees', nameBn: 'টিউশন ফি', sortOrder: 1 },
      { name: 'Books & Stationery', nameBn: 'বই ও স্টেশনারি', sortOrder: 2 },
    ],
  },
  {
    name: 'Entertainment',
    nameBn: 'বিনোদন',
    icon: 'gamepad-2',
    color: '#FF6E40',
    isDefault: true,
    sortOrder: 7,
    subcategories: [
      { name: 'Movies & Outings', nameBn: 'সিনেমা ও আড্ডা', sortOrder: 1 },
      { name: 'Games & Events', nameBn: 'গেমস ও অনুষ্ঠান', sortOrder: 2 },
    ],
  },
  {
    name: 'Travel',
    nameBn: 'ভ্রমণ',
    icon: 'plane',
    color: '#00BCD4',
    isDefault: true,
    sortOrder: 8,
    subcategories: [
      { name: 'Hotel & Stay', nameBn: 'হোটেল', sortOrder: 1 },
      { name: 'Tickets', nameBn: 'টিকিট', sortOrder: 2 },
    ],
  },
  {
    name: 'Bills & Subscriptions',
    nameBn: 'বিল ও সাবস্ক্রিপশন',
    icon: 'receipt',
    color: '#FFD54F',
    isDefault: true,
    sortOrder: 9,
    subcategories: [
      { name: 'Electricity Bill', nameBn: 'বিদ্যুৎ বিল', sortOrder: 1 },
      { name: 'Internet Bill', nameBn: 'ইন্টারনেট বিল', sortOrder: 2 },
      { name: 'Water & Gas', nameBn: 'পানি ও গ্যাস', sortOrder: 3 },
      { name: 'Mobile Recharge', nameBn: 'মোবাইল রিচার্জ', sortOrder: 4 },
    ],
  },
  {
    name: 'Financial',
    nameBn: 'আর্থিক',
    icon: 'landmark',
    color: '#4DB6AC',
    isDefault: true,
    sortOrder: 10,
    subcategories: [
      { name: 'Loan EMI', nameBn: 'কিস্তি / ঋণ', sortOrder: 1 },
      { name: 'Savings / DPS', nameBn: 'সঞ্চয় / ডিপিএস', sortOrder: 2 },
    ],
  },
  {
    name: 'Family & Personal',
    nameBn: 'পরিবার ও ব্যক্তিগত',
    icon: 'users',
    color: '#F48FB1',
    isDefault: true,
    sortOrder: 11,
    subcategories: [
      { name: 'Family Care', nameBn: 'পারিবারিক খরচ', sortOrder: 1 },
      { name: 'Self Care', nameBn: 'নিজের যত্ন', sortOrder: 2 },
    ],
  },
  {
    name: 'Pets',
    nameBn: 'পোষা প্রাণী',
    icon: 'paw-print',
    color: '#A1887F',
    isDefault: true,
    sortOrder: 12,
    subcategories: [
      { name: 'Pet Food', nameBn: 'পোষা প্রাণীর খাবার', sortOrder: 1 },
      { name: 'Vet Care', nameBn: 'চিকিৎসা', sortOrder: 2 },
    ],
  },
  {
    name: 'Work & Business',
    nameBn: 'কাজ ও ব্যবসা',
    icon: 'briefcase',
    color: '#90A4AE',
    isDefault: true,
    sortOrder: 13,
    subcategories: [
      { name: 'Office Supplies', nameBn: 'অফিস সাপ্লাই', sortOrder: 1 },
    ],
  },
  {
    name: 'Gifts & Donations',
    nameBn: 'উপহার ও দান',
    icon: 'gift',
    color: '#CE93D8',
    isDefault: true,
    sortOrder: 14,
    subcategories: [
      { name: 'Zakat / Sadaqah', nameBn: 'যাকাত ও সদকা', sortOrder: 1 },
      { name: 'Gifts', nameBn: 'উপহার', sortOrder: 2 },
    ],
  },
  {
    name: 'Other',
    nameBn: 'অন্যান্য',
    icon: 'ellipsis',
    color: '#B0BEC5',
    isDefault: true,
    sortOrder: 15,
    subcategories: [
      { name: 'Miscellaneous', nameBn: 'বিবিধ', sortOrder: 1 },
    ],
  },
];

const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', nameBn: 'নগদ অর্থ', icon: 'banknote', isDefault: true, sortOrder: 1 },
  { name: 'bKash', nameBn: 'বিকাশ', icon: 'smartphone', isDefault: false, sortOrder: 2 },
  { name: 'Nagad', nameBn: 'নগদ', icon: 'smartphone', isDefault: false, sortOrder: 3 },
  { name: 'Rocket', nameBn: 'রকেট', icon: 'smartphone', isDefault: false, sortOrder: 4 },
  { name: 'Credit Card', nameBn: 'ক্রেডিট কার্ড', icon: 'credit-card', isDefault: false, sortOrder: 5 },
  { name: 'Debit Card', nameBn: 'ডেবিট কার্ড', icon: 'credit-card', isDefault: false, sortOrder: 6 },
  { name: 'Bank Transfer', nameBn: 'ব্যাংক ট্রান্সফার', icon: 'landmark', isDefault: false, sortOrder: 7 },
  { name: 'Other', nameBn: 'অন্যান্য', icon: 'ellipsis', isDefault: false, sortOrder: 8 },
];

async function runSeed() {
  console.log('Connecting to PostgreSQL database for seeding...');

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
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Database connected & synchronized successfully.');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);
  const subcategoryRepo = dataSource.getRepository(Subcategory);
  const paymentMethodRepo = dataSource.getRepository(PaymentMethod);
  const settingRepo = dataSource.getRepository(SystemSetting);

  // 1. Seed Default Admin User
  const adminEmail = 'admin@khoroch.app';
  let admin = await userRepo.findOne({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    admin = userRepo.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      preferredCurrency: CurrencyCode.BDT,
      preferredLocale: 'en',
      isActive: true,
    });
    await userRepo.save(admin);
    console.log('✅ Admin user created: admin@khoroch.app / Admin123!');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // 2. Seed Default Demo User
  const demoEmail = 'user@khoroch.app';
  let demoUser = await userRepo.findOne({ where: { email: demoEmail } });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('User123!', 10);
    demoUser = userRepo.create({
      email: demoEmail,
      password: hashedPassword,
      firstName: 'Tarek',
      lastName: 'Hasan',
      role: UserRole.USER,
      preferredCurrency: CurrencyCode.BDT,
      preferredLocale: 'en',
      isActive: true,
    });
    await userRepo.save(demoUser);
    console.log('✅ Demo user created: user@khoroch.app / User123!');
  }

  // 3. Seed Categories & Subcategories
  for (const catData of DEFAULT_CATEGORIES) {
    let cat = await categoryRepo.findOne({ where: { name: catData.name } });
    if (!cat) {
      cat = categoryRepo.create({
        name: catData.name,
        nameBn: catData.nameBn,
        icon: catData.icon,
        color: catData.color,
        isDefault: catData.isDefault,
        sortOrder: catData.sortOrder,
        isEnabled: true,
      });
      cat = await categoryRepo.save(cat);
      console.log(`  + Category: ${cat.name}`);
    }

    for (const subData of catData.subcategories) {
      let sub = await subcategoryRepo.findOne({
        where: { categoryId: cat.id, name: subData.name },
      });
      if (!sub) {
        sub = subcategoryRepo.create({
          categoryId: cat.id,
          name: subData.name,
          nameBn: subData.nameBn,
          sortOrder: subData.sortOrder,
          isEnabled: true,
        });
        await subcategoryRepo.save(sub);
      }
    }
  }
  console.log('✅ Categories and subcategories seeded.');

  // 4. Seed Payment Methods
  for (const pmData of DEFAULT_PAYMENT_METHODS) {
    let pm = await paymentMethodRepo.findOne({ where: { name: pmData.name } });
    if (!pm) {
      pm = paymentMethodRepo.create({
        name: pmData.name,
        nameBn: pmData.nameBn,
        icon: pmData.icon,
        isDefault: pmData.isDefault,
        sortOrder: pmData.sortOrder,
        isEnabled: true,
      });
      await paymentMethodRepo.save(pm);
      console.log(`  + Payment Method: ${pm.name}`);
    }
  }
  console.log('✅ Payment methods seeded.');

  // 5. Seed System Settings
  const defaultSettings = [
    { key: 'default_currency', value: 'BDT', description: 'System default currency' },
    { key: 'supported_currencies', value: ['BDT', 'USD'], description: 'Supported currencies' },
    { key: 'supported_locales', value: ['en', 'bn'], description: 'Supported UI languages' },
    { key: 'max_receipt_size_bytes', value: 10485760, description: 'Max receipt upload size (10 MB)' },
    { key: 'low_balance_threshold_pct', value: 10, description: 'Low balance alert threshold (%)' },
  ];

  for (const s of defaultSettings) {
    let setting = await settingRepo.findOne({ where: { key: s.key } });
    if (!setting) {
      setting = settingRepo.create({
        key: s.key,
        value: s.value,
        description: s.description,
        updatedBy: admin.id,
      });
      await settingRepo.save(setting);
    }
  }
  console.log('✅ System settings seeded.');

  await dataSource.destroy();
  console.log('Seeding finished successfully.');
}

runSeed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
