import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/database/entities';

@ApiTags('Analytics & Dashboard')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overview dashboard metrics and recent expenses' })
  async getDashboard(
    @CurrentUser() user: User,
    @Query('month') month?: number,
    @Query('year') year?: number,
  ) {
    const data = await this.analyticsService.getDashboard(user.id, month, year);
    return { data };
  }

  @Get('breakdown')
  @ApiOperation({ summary: 'Get category or payment method spending breakdown' })
  async getBreakdown(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    const data = await this.analyticsService.getBreakdown(
      user.id,
      startDate,
      endDate,
      groupBy,
    );
    return { data };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get time-series spending trends' })
  async getTrends(
    @CurrentUser() user: User,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: string,
  ) {
    const data = await this.analyticsService.getTrends(
      user.id,
      startDate,
      endDate,
      period,
    );
    return { data };
  }
}
