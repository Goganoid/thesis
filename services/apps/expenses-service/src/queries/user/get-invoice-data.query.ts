import { UserData } from '@app/auth';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserInvoiceDataDto } from '../../dto/user-invoice-data.dto';
import { CategoryEntity } from '../../entities/category.entity';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { getYearFilter } from '../../helpers/getYearFilter';
import { getInvoiceMapper } from '../../helpers/mappers/toInvoiceDto';
import { sumPaidInvoices } from '../../helpers/sumPaidInvoices';
import { GetInvoiceDataDto } from '../../dto/get-invoice-data.dto';
import { S3Service } from '../../services/s3.service';

export class GetInvoicesQuery extends Query<UserInvoiceDataDto> {
  constructor(
    public readonly args: { user: UserData; dto: GetInvoiceDataDto },
  ) {
    super();
  }
}

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoicesRepository: Repository<InvoiceEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
    private readonly s3Service: S3Service,
  ) {}

  async execute({ args: { user, dto } }: GetInvoicesQuery) {
    const invoices = await this.invoicesRepository.find({
      where: {
        userId: user.id,
        createdAt: getYearFilter(dto.year),
        ...(dto.status?.length && { status: In(dto.status) }),
      },
    });
    const categories = await this.categoriesRepository.find({
      order: { order: 'ASC' },
    });
    const { toInvoiceDto } = getInvoiceMapper(this.s3Service);
    return {
      invoices: await Promise.all(invoices.map(toInvoiceDto)),
      categories: categories.map((categoryData) => ({
        category: categoryData.id,
        limit: categoryData.limit,
        used: sumPaidInvoices(
          invoices.filter((i) => i.category === categoryData.id),
        ),
      })),
    };
  }
}
