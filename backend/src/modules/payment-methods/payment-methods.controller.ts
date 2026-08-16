import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentMethodsService } from './payment-methods.service';

@ApiTags('Payment Methods')
@ApiBearerAuth()
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all enabled payment methods' })
  async findAll() {
    const data = await this.paymentMethodsService.findAllEnabled();
    return { data };
  }
}
