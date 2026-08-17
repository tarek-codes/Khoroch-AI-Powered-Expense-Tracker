import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/roles.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Root & Health Check' })
  getRoot() {
    return {
      name: 'Khoroch AI Expense Tracker API',
      version: '1.0.0',
      status: 'healthy',
      docs: '/api/docs',
    };
  }
}
