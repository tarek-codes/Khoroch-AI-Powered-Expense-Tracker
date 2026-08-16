import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { SetBudgetDto, UpdateBudgetDto, BudgetQueryDto } from './dto/budget.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Monthly Budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get monthly budget summary and remaining balance' })
  async getSummary(
    @CurrentUser() user: User,
    @Query() query: BudgetQueryDto,
  ) {
    const data = await this.budgetsService.getSummary(user.id, query);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List budget history' })
  async getHistory(
    @CurrentUser() user: User,
    @Query('year') year?: number,
  ) {
    const data = await this.budgetsService.getHistory(user.id, year);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Set or initialize monthly starting balance' })
  async setBudget(
    @CurrentUser() user: User,
    @Body() setBudgetDto: SetBudgetDto,
  ) {
    const data = await this.budgetsService.setBudget(user.id, setBudgetDto);
    return {
      message: 'Monthly budget configured successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update monthly starting balance' })
  async updateBudget(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
  ) {
    const data = await this.budgetsService.updateBudget(
      user.id,
      id,
      updateBudgetDto,
    );
    return {
      message: 'Budget updated successfully',
      data,
    };
  }
}
