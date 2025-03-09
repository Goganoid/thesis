import { UserData } from '@app/auth';
import { UserRole } from '@app/shared';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { InvoiceStatus } from '../../enums/invoice.status';

export class UpdateInvoiceStatusCommand extends Command<void> {
  constructor(
    public readonly args: {
      invoiceId: string;
      status: InvoiceStatus;
      user: UserData;
    },
  ) {
    super();
  }
}

@CommandHandler(UpdateInvoiceStatusCommand)
export class UpdateInvoiceStatusHandler
  implements ICommandHandler<UpdateInvoiceStatusCommand>
{
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoicesRepository: Repository<InvoiceEntity>,
  ) {}

  async execute({ args }: UpdateInvoiceStatusCommand) {
    const invoice = await this.invoicesRepository.findOneByOrFail({
      id: args.invoiceId,
    });

    const isAdmin = args.user.role !== UserRole.User;
    if (!isAdmin) {
      throw new ForbiddenException('No access');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot change status of the paid invoice');
    }

    await this.invoicesRepository.update(args.invoiceId, {
      status: args.status,
    });
  }
}
