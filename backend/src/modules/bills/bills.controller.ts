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
import { BillsService } from './bills.service';
import { CreateBillDto, UpdateBillDto, BillQueryDto } from './dto/bills.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Utility Bills')
@ApiBearerAuth()
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all utility bills with monthly summary' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: BillQueryDto,
  ) {
    const data = await this.billsService.findAll(user.id, query);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single utility bill' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.billsService.findOne(user.id, id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Add a new utility bill' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateBillDto,
  ) {
    const data = await this.billsService.create(user.id, dto);
    return {
      message: 'Utility bill added successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update utility bill' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateBillDto,
  ) {
    const data = await this.billsService.update(user.id, id, dto);
    return {
      message: 'Utility bill updated',
      data,
    };
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Toggle bill payment status (deducts from balance when marked as paid)' })
  async togglePay(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const result = await this.billsService.togglePay(user.id, id);
    return {
      message: result.bill.status === 'paid' ? 'Bill marked as paid and deducted from balance' : 'Bill marked as unpaid',
      data: result.bill,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete utility bill' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.billsService.remove(user.id, id);
    return data;
  }
}
