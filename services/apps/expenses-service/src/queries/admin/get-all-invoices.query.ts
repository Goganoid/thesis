import { UserData } from '@app/auth';
import { UserRole } from '@app/shared';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetInvoiceDataDto } from '../../dto/get-invoice-data.dto';
import { InvoiceDto } from '../../dto/invoice.dto';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { getYearFilter } from '../../helpers/getYearFilter';
import { toInvoiceDto } from '../../helpers/mappers/toInvoiceDto';
import { validateRole } from '../../helpers/validateRole';

export class GetAllInvoicesQuery extends Query<InvoiceDto[]> {
  constructor(
    public readonly args: { user: UserData; dto: GetInvoiceDataDto },
  ) {
    super();
  }
}

@QueryHandler(GetAllInvoicesQuery)
export class GetAllInvoicesHandler
  implements IQueryHandler<GetAllInvoicesQuery>
{
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoicesRepository: Repository<InvoiceEntity>,
  ) {}

  async execute({ args: { dto, user } }: GetAllInvoicesQuery) {
    validateRole([UserRole.Admin, UserRole.Bookkeeper], user.role);
    const invoices = await this.invoicesRepository.find({
      where: { userId: user.id, createdAt: getYearFilter(dto.year) },
    });
    return invoices.map(toInvoiceDto);
  }
}
