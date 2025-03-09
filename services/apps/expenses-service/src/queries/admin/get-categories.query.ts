import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesDto } from '../../dto/categories.dto';
import { CategoryEntity } from '../../entities/category.entity';

export class GetCategoriesQuery extends Query<CategoriesDto> {
  constructor() {
    super();
  }
}

@QueryHandler(GetCategoriesQuery)
export class GetCategoriesHandler implements IQueryHandler<GetCategoriesQuery> {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async execute() {
    const categories = await this.categoriesRepository.find();
    return {
      categories: categories.map((c) => ({ id: c.id, limit: c.limit })),
    };
  }
}
