import { UserRole } from '@app/shared';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../enums/invoice.status';

export class DeleteInvoiceCommand implements ICommand {
  constructor(
    public readonly args: {
      invoiceId: string;
      userId: string;
      userRole: UserRole;
    },
  ) {}
}

@CommandHandler(DeleteInvoiceCommand)
export class DeleteInvoiceHandler
  implements ICommandHandler<DeleteInvoiceCommand>
{
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoicesRepository: Repository<InvoiceEntity>,
  ) {}

  async execute({ args }: DeleteInvoiceCommand) {
    const invoice = await this.invoicesRepository.findOneByOrFail({
      id: args.invoiceId,
    });

    const invoiceNotProcessed =
      invoice.status === InvoiceStatus.WAITING_APPROVAL ||
      invoice.status === InvoiceStatus.IN_PROGRESS;

    const isAdmin =
      args.userRole === UserRole.Admin || args.userRole === UserRole.Manager;
    const isInvoiceOwner = args.userId == invoice.userId;
    const hasAccessToInvoice = isAdmin || isInvoiceOwner;

    if (!invoiceNotProcessed) {
      throw new BadRequestException(
        'The invoice was processed and cannot be deleted',
      );
    }

    if (!hasAccessToInvoice) {
      throw new ForbiddenException('No access');
    }

    return await this.invoicesRepository.delete(args.invoiceId);
  }
}
