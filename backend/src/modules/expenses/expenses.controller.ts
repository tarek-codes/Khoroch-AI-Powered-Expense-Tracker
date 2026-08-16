import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import {
  CreateExpenseDto,
  UpdateExpenseDto,
  BatchConfirmExpensesDto,
  ExpenseQueryDto,
} from './dto/expense.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List and filter expenses' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: ExpenseQueryDto,
  ) {
    const data = await this.expensesService.findAll(user.id, query);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single expense details' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.expensesService.findOne(user.id, id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create manual expense' })
  async create(
    @CurrentUser() user: User,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    const data = await this.expensesService.create(user.id, createExpenseDto);
    return {
      message: 'Expense created successfully',
      data,
    };
  }

  @Post('batch-confirm')
  @ApiOperation({ summary: 'Batch confirm AI voice or receipt expenses' })
  async batchConfirm(
    @CurrentUser() user: User,
    @Body() dto: BatchConfirmExpensesDto,
  ) {
    const data = await this.expensesService.batchConfirm(user.id, dto);
    return {
      message: `${data.length} expense(s) confirmed and recorded successfully`,
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update existing expense' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const data = await this.expensesService.update(
      user.id,
      id,
      updateExpenseDto,
    );
    return {
      message: 'Expense updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.expensesService.remove(user.id, id);
    return data;
  }
}
