import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '@/database/entities';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  async findAllEnabled() {
    return await this.paymentMethodRepository.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC' },
    });
  }
}
