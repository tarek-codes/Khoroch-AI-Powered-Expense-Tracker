import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Subcategory } from '@/database/entities';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private subcategoryRepository: Repository<Subcategory>,
  ) {}

  async findAllEnabled() {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect(
        'category.subcategories',
        'subcategory',
        'subcategory.is_enabled = true',
      )
      .where('category.is_enabled = true')
      .orderBy('category.sort_order', 'ASC')
      .addOrderBy('subcategory.sort_order', 'ASC')
      .getMany();
  }
}
