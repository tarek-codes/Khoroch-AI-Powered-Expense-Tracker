import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  CreateAdminCategoryDto,
  UpdateAdminCategoryDto,
  CreateAdminSubcategoryDto,
  CreateAdminPaymentMethodDto,
  UpdateUserStatusDto,
  UpdateUserRoleDto,
  UpdateSettingDto,
} from './dto/admin.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Admin Panel')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // USER MANAGEMENT
  @Get('users')
  @ApiOperation({ summary: 'List all users (Admin)' })
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    const data = await this.adminService.listUsers(Number(page), Number(limit), search);
    return { data };
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get single user details & spending metrics (Admin)' })
  async getUserDetails(@Param('id') id: string) {
    const data = await this.adminService.getUserDetails(id);
    return { data };
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Toggle user active status (Admin)' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const data = await this.adminService.updateUserStatus(id, dto);
    return {
      message: 'User status updated successfully',
      data,
    };
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin)' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const data = await this.adminService.updateUserRole(id, dto);
    return {
      message: 'User role updated successfully',
      data,
    };
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account (Admin)' })
  async deleteUser(@Param('id') id: string) {
    const data = await this.adminService.deleteUser(id);
    return data;
  }

  // CATEGORIES
  @Get('categories')
  @ApiOperation({ summary: 'List all categories with subcategories (Admin)' })
  async listAllCategories() {
    const data = await this.adminService.listAllCategories();
    return { data };
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create category (Admin)' })
  async createCategory(@Body() dto: CreateAdminCategoryDto) {
    const data = await this.adminService.createCategory(dto);
    return { message: 'Category created successfully', data };
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category (Admin)' })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCategoryDto,
  ) {
    const data = await this.adminService.updateCategory(id, dto);
    return { message: 'Category updated successfully', data };
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete category (Admin)' })
  async deleteCategory(@Param('id') id: string) {
    const data = await this.adminService.deleteCategory(id);
    return data;
  }

  // SUBCATEGORIES
  @Post('categories/:id/subcategories')
  @ApiOperation({ summary: 'Create subcategory under category (Admin)' })
  async createSubcategory(
    @Param('id') categoryId: string,
    @Body() dto: CreateAdminSubcategoryDto,
  ) {
    const data = await this.adminService.createSubcategory(categoryId, dto);
    return { message: 'Subcategory created successfully', data };
  }

  @Patch('subcategories/:id')
  @ApiOperation({ summary: 'Update subcategory (Admin)' })
  async updateSubcategory(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdminSubcategoryDto>,
  ) {
    const data = await this.adminService.updateSubcategory(id, dto);
    return { message: 'Subcategory updated successfully', data };
  }

  @Delete('subcategories/:id')
  @ApiOperation({ summary: 'Delete subcategory (Admin)' })
  async deleteSubcategory(@Param('id') id: string) {
    const data = await this.adminService.deleteSubcategory(id);
    return data;
  }

  // PAYMENT METHODS
  @Get('payment-methods')
  @ApiOperation({ summary: 'List all payment methods (Admin)' })
  async listAllPaymentMethods() {
    const data = await this.adminService.listAllPaymentMethods();
    return { data };
  }

  @Post('payment-methods')
  @ApiOperation({ summary: 'Create payment method (Admin)' })
  async createPaymentMethod(@Body() dto: CreateAdminPaymentMethodDto) {
    const data = await this.adminService.createPaymentMethod(dto);
    return { message: 'Payment method created successfully', data };
  }

  @Patch('payment-methods/:id')
  @ApiOperation({ summary: 'Update payment method (Admin)' })
  async updatePaymentMethod(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAdminPaymentMethodDto>,
  ) {
    const data = await this.adminService.updatePaymentMethod(id, dto);
    return { message: 'Payment method updated successfully', data };
  }

  @Delete('payment-methods/:id')
  @ApiOperation({ summary: 'Delete payment method (Admin)' })
  async deletePaymentMethod(@Param('id') id: string) {
    const data = await this.adminService.deletePaymentMethod(id);
    return data;
  }

  // EXPENSES AUDIT
  @Get('expenses')
  @ApiOperation({ summary: 'Audit all platform expenses (Admin)' })
  async listAllExpenses(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.adminService.listAllExpenses(Number(page), Number(limit));
    return { data };
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Force delete expense (Admin)' })
  async forceDeleteExpense(@Param('id') id: string) {
    const data = await this.adminService.forceDeleteExpense(id);
    return data;
  }

  // ANALYTICS & LOGS
  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get platform-wide overview statistics (Admin)' })
  async getOverviewAnalytics() {
    const data = await this.adminService.getOverviewAnalytics();
    return { data };
  }

  @Get('analytics/ai-logs')
  @ApiOperation({ summary: 'List AI processing logs (Admin)' })
  async listAiLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const data = await this.adminService.listAiLogs(Number(page), Number(limit));
    return { data };
  }

  // SYSTEM SETTINGS
  @Get('settings')
  @ApiOperation({ summary: 'Get application settings (Admin)' })
  async getSettings() {
    const data = await this.adminService.getSettings();
    return { data };
  }

  @Patch('settings/:key')
  @ApiOperation({ summary: 'Update specific system setting (Admin)' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.adminService.updateSetting(key, dto, user.id);
    return { message: 'Setting updated successfully', data };
  }
}
