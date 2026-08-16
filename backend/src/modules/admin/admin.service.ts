import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  User,
  Category,
  Subcategory,
  PaymentMethod,
  Expense,
  AiProcessingLog,
  SystemSetting,
} from '@/database/entities';
import {
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto,
  CreateAdminSubcategoryDto,
  CreateAdminPaymentMethodDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  UpdateSettingDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(AiProcessingLog)
    private aiLogRepository: Repository<AiProcessingLog>,
    @InjectRepository(SystemSetting)
    private settingRepository: Repository<SystemSetting>,
  ) {}

  // USER MANAGEMENT
  async listUsers(page = 1, limit = 20, search?: string) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (search) {
      qb.where(
        '(LOWER(user.email) LIKE :search OR LOWER(user.first_name) LIKE :search OR LOWER(user.last_name) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [items, totalItems] = await qb
      .orderBy('user.created_at', 'DESC')
      .skip((page - 1) * limit)
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

  async getUserDetails(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['budgets'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalExpenses = await this.expenseRepository.count({
      where: { userId: id, isConfirmed: true },
    });

    const sumExpenses = await this.expenseRepository
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.user_id = :id', { id })
      .andWhere('e.is_confirmed = true')
      .getRawOne();

    return {
      user,
      totalExpensesCount: totalExpenses,
      totalSpentAmount: parseFloat(sumExpenses?.total || '0'),
    };
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = dto.isActive;
    return await this.userRepository.save(user);
  }

  async updateUserRole(id: string, dto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.role = dto.role;
    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { message: 'User account and associated data removed' };
  }

  // CATEGORY MANAGEMENT
  async listAllCategories() {
    return await this.categoryRepository.find({
      relations: ['subcategories'],
      order: { sortOrder: 'ASC' },
    });
  }

  async createCategory(dto: CreateAdminCategoryDto) {
    const cat = this.categoryRepository.create(dto);
    return await this.categoryRepository.save(cat);
  }

  async updateCategory(id: string, dto: UpdateAdminCategoryDto) {
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    Object.assign(cat, dto);
    return await this.categoryRepository.save(cat);
  }

  async deleteCategory(id: string) {
    const count = await this.expenseRepository.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete category actively assigned to existing expenses. Reassign expenses first.',
      );
    }
    const subCount = await this.subcategoryRepository.count({
      where: { categoryId: id },
    });
    if (subCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with active subcategories. Remove subcategories first.',
      );
    }
    const cat = await this.categoryRepository.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    await this.categoryRepository.remove(cat);
    return { message: 'Category deleted successfully' };
  }

  async createSubcategory(categoryId: string, dto: CreateAdminSubcategoryDto) {
    const cat = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!cat) throw new NotFoundException('Parent category not found');
    const sub = this.subcategoryRepository.create({
      categoryId,
      ...dto,
    });
    return await this.subcategoryRepository.save(sub);
  }

  async updateSubcategory(id: string, dto: Partial<CreateAdminSubcategoryDto>) {
    const sub = await this.subcategoryRepository.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subcategory not found');
    Object.assign(sub, dto);
    return await this.subcategoryRepository.save(sub);
  }

  async deleteSubcategory(id: string) {
    const count = await this.expenseRepository.count({
      where: { subcategoryId: id },
    });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete subcategory actively assigned to expenses. Reassign first.',
      );
    }
    const sub = await this.subcategoryRepository.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Subcategory not found');
    await this.subcategoryRepository.remove(sub);
    return { message: 'Subcategory deleted successfully' };
  }

  // PAYMENT METHODS MANAGEMENT
  async listAllPaymentMethods() {
    return await this.paymentMethodRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async createPaymentMethod(dto: CreateAdminPaymentMethodDto) {
    const pm = this.paymentMethodRepository.create(dto);
    return await this.paymentMethodRepository.save(pm);
  }

  async updatePaymentMethod(id: string, dto: Partial<CreateAdminPaymentMethodDto>) {
    const pm = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    Object.assign(pm, dto);
    return await this.paymentMethodRepository.save(pm);
  }

  async deletePaymentMethod(id: string) {
    const pm = await this.paymentMethodRepository.findOne({ where: { id } });
    if (!pm) throw new NotFoundException('Payment method not found');
    await this.paymentMethodRepository.remove(pm);
    return { message: 'Payment method deleted successfully' };
  }

  // EXPENSES AUDIT
  async listAllExpenses(page = 1, limit = 20) {
    const [items, totalItems] = await this.expenseRepository.findAndCount({
      relations: ['user', 'category', 'paymentMethod', 'receipt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
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

  async forceDeleteExpense(id: string) {
    const exp = await this.expenseRepository.findOne({ where: { id } });
    if (!exp) throw new NotFoundException('Expense record not found');
    await this.expenseRepository.remove(exp);
    return { message: 'Expense record purged successfully' };
  }

  // OVERVIEW ANALYTICS & LOGS
  async getOverviewAnalytics() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { isActive: true },
    });
    const totalExpensesCount = await this.expenseRepository.count();
    const volumeQuery = await this.expenseRepository
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.is_confirmed = true')
      .getRawOne();
    const totalVolumeTracked = parseFloat(volumeQuery?.total || '0');

    const voiceLogs = await this.aiLogRepository.count({
      where: { type: 'voice' as any },
    });
    const receiptLogs = await this.aiLogRepository.count({
      where: { type: 'receipt' as any },
    });

    return {
      totalUsers,
      activeUsers,
      totalExpensesCount,
      totalVolumeTracked,
      aiVoiceUsageCount: voiceLogs,
      receiptScansCount: receiptLogs,
      currency: 'BDT',
    };
  }

  async listAiLogs(page = 1, limit = 20) {
    const [items, totalItems] = await this.aiLogRepository.findAndCount({
      relations: ['user', 'receipt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
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

  // SYSTEM SETTINGS
  async getSettings() {
    const settings = await this.settingRepository.find();
    const result: Record<string, any> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return result;
  }

  async updateSetting(key: string, dto: UpdateSettingDto, adminUserId: string) {
    let setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingRepository.create({
        key,
        value: dto.value,
        updatedBy: adminUserId,
      });
    } else {
      setting.value = dto.value;
      setting.updatedBy = adminUserId;
    }
    return await this.settingRepository.save(setting);
  }
}
