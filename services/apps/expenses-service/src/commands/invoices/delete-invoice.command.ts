import { UserRole } from '@app/shared';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../enums/invoice.status';
import { UserData } from '@app/auth';

export class DeleteInvoiceCommand implements ICommand {
  constructor(
    public readonly args: {
      invoiceId: string;
      user: UserData;
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
      args.user.role === UserRole.Admin || args.user.role === UserRole.Manager;
    const isInvoiceOwner = args.user.id == invoice.userId;
    const hasAccessToInvoice = isAdmin || isInvoiceOwner;

    if (!invoiceNotProcessed) {
      throw new BadRequestException(
        'The invoice was processed and cannot be deleted',
      );
    }

    if (!hasAccessToInvoice) {
      throw new ForbiddenException('No access');
    }

    await this.invoicesRepository.delete(args.invoiceId);
  }
}
