import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { addYears } from 'date-fns';
import { Between, Repository } from 'typeorm';
import { CreateInvoiceDto } from '../../dto/create-invoice.dto';
import { CategoryEntity } from '../../entities/category.entity';
import { InvoiceEntity } from '../../entities/invoice.entity';
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
      category: args.invoice.category,
    });

    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const thisYearInvoices = await this.invoicesRepository.find({
      where: { createdAt: Between(startDate, addYears(startDate, 1)) },
    });

    const totalPaid = sumPaidInvoices(thisYearInvoices);

    if (totalPaid + args.invoice.amount >= category.limit) {
      throw new BadRequestException('The limit is exceeded');
    }

    return await this.invoicesRepository.save({
      ...args.invoice,
      userId: args.userId,
    });
  }
}
