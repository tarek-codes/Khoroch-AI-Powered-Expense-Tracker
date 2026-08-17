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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto, SubscriptionQueryDto } from './dto/subscriptions.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all recurring subscriptions with monthly summary' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: SubscriptionQueryDto,
  ) {
    const data = await this.subscriptionsService.findAll(user.id, query);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single subscription' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.subscriptionsService.findOne(user.id, id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Add a new subscription' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateSubscriptionDto,
  ) {
    const data = await this.subscriptionsService.create(user.id, dto);
    return {
      message: 'Subscription added successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subscription' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    const data = await this.subscriptionsService.update(user.id, id, dto);
    return {
      message: 'Subscription updated',
      data,
    };
  }

  @Patch(':id/pay')
  @ApiOperation({ summary: 'Toggle subscription payment status (deducts from balance when marked as paid)' })
  async togglePay(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const result = await this.subscriptionsService.togglePay(user.id, id);
    return {
      message: result.subscription.status === 'paid' ? 'Subscription marked as paid and deducted from balance' : 'Subscription marked as unpaid',
      data: result.subscription,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription' })
  async remove(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    const data = await this.subscriptionsService.remove(user.id, id);
    return data;
  }
}
