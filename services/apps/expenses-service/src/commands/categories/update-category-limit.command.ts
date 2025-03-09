import { UserRole } from '@app/shared';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../../entities/category.entity';
import { InvoiceCategory } from '../../enums/invoice.category';
import { InvoiceStatus } from '../../enums/invoice.status';

export class UpdateCategoryLimitCommand implements ICommand {
  constructor(
    public readonly args: {
      category: InvoiceCategory;
      limit: number;
      userRole: UserRole;
    },
  ) {}
}

@CommandHandler(UpdateCategoryLimitCommand)
export class UpdateCategoryLimitHandler
  implements ICommandHandler<UpdateCategoryLimitCommand>
{
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepository: Repository<CategoryEntity>,
  ) {}

  async execute({ args }: UpdateCategoryLimitCommand) {
    const category = await this.categoriesRepository.findOneOrFail({
      where: { id: args.category },
      relations: { invoices: true },
    });

    const limitDecreased = category.limit > args.limit;
    if (limitDecreased) {
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < category.invoices.length; i += 1) {
        const invoice = category.invoices[i];
        const isThisYearInvoice =
          invoice.createdAt.getFullYear() === currentYear;
        const isNotPaid =
          invoice.status === InvoiceStatus.WAITING_APPROVAL ||
          invoice.status === InvoiceStatus.IN_PROGRESS;
        if (isThisYearInvoice && isNotPaid) {
          category.invoices[i].status = InvoiceStatus.REJECTED;
        }
      }
    }

    category.limit = args.limit;

    await this.categoriesRepository.save(category);
  }
}
