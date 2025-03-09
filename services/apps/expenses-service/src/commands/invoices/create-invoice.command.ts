import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from '../../dto/create-invoice.dto';
import { CategoryEntity } from '../../entities/category.entity';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { getYearFilter } from '../../helpers/getYearFilter';
import { sumPaidInvoices } from '../../helpers/sumPaidInvoices';

export class CreateInvoiceCommand implements ICommand {
  constructor(
    public readonly args: { invoice: CreateInvoiceDto; userId: string },
  ) {}
}

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler
  implements ICommandHandler<CreateInvoiceCommand>
{
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoicesRepository: Repository<InvoiceEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async execute({ args }: CreateInvoiceCommand) {
    const category = await this.categoriesRepository.findOneByOrFail({
      id: args.invoice.category,
    });

    const thisYearInvoices = await this.invoicesRepository.find({
      where: { createdAt: getYearFilter(new Date().getFullYear()) },
    });

    const totalPaid = sumPaidInvoices(thisYearInvoices);

    if (totalPaid + args.invoice.amount >= category.limit) {
      throw new BadRequestException('The limit is exceeded');
    }

    await this.invoicesRepository.save({
      ...args.invoice,
      userId: args.userId,
    });
  }
}
