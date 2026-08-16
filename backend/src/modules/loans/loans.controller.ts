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
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanDto, LoanQueryDto } from './dto/loans.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Lend / Borrow')
@ApiBearerAuth()
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get summary KPIs of lent and borrowed amounts' })
  async getSummary(@CurrentUser() user: User) {
    const data = await this.loansService.getSummary(user.id);
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List all lent and borrowed records' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: LoanQueryDto,
  ) {
    const data = await this.loansService.findAll(user.id, query);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single loan/lend details' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.loansService.findOne(user.id, id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lend or borrow record' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateLoanDto,
  ) {
    const data = await this.loansService.create(user.id, dto);
    return {
      message: `${dto.type === 'lend' ? 'Lend' : 'Borrow'} record added successfully`,
      data,
    };
  }

  @Patch(':id/settle')
  @ApiOperation({ summary: 'Mark a lend/borrow record as Paid Back / Settled' })
  async settle(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.loansService.settle(user.id, id);
    return {
      message: data.status === 'settled' ? 'Marked as Paid Back / Settled' : 'Marked as Pending',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lend/borrow record' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateLoanDto,
  ) {
    const data = await this.loansService.update(user.id, id, dto);
    return {
      message: 'Record updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lend/borrow record' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const result = await this.loansService.remove(user.id, id);
    return result;
  }
}
