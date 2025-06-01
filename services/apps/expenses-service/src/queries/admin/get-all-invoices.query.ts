import { UserData } from '@app/auth';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { getYearFilter } from '../../../../../libs/shared/src/typeorm/getYearFilter';
import { GetInvoiceDataDto } from '../../dto/get-invoice-data.dto';
import { InvoiceDto } from '../../dto/invoice.dto';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { getInvoiceMapper } from '../../helpers/mappers/toInvoiceDto';
import { S3Service } from '../../services/s3.service';

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
    private readonly s3Service: S3Service,
  ) {}

  async execute({ args: { dto, user } }: GetAllInvoicesQuery) {
    const { toInvoiceDto } = getInvoiceMapper(this.s3Service);
    const invoices = await this.invoicesRepository.find({
      where: {
        userId: user.id,
        createdAt: getYearFilter(dto.year),
        ...(dto.status?.length && { status: In(dto.status) }),
      },
      relations: {
        categoryRef: true,
      },
    });
    return await Promise.all(invoices.map(toInvoiceDto));
  }
}
