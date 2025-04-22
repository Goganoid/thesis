import { BadRequestException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { UserClient } from '../../grpc/user-client.service';
import { uniq } from 'lodash';
import { Between, Repository } from 'typeorm';
import { GenerateReportDto } from '../../dto/generate-report.dto';
import { InvoiceEntity } from '../../entities/invoice.entity';

export class GenerateReportCommand extends Command<string> {
  constructor(public readonly dto: GenerateReportDto) {
    super();
  }
}

@CommandHandler(GenerateReportCommand)
export class GenerateReportHandler
  implements ICommandHandler<GenerateReportCommand>
{
  constructor(
    private readonly userClient: UserClient,
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
  ) {}

  async execute({ dto }: GenerateReportCommand) {
    const { end, start } = dto;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException('Start date must be before end date');
    }

    const invoices = await this.invoiceRepository.find({
      where: {
        createdAt: Between(new Date(start), new Date(end)),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const members = await this.userClient.findMany(
      uniq(invoices.map((r) => r.userId)),
    );

    const rows = invoices.map((invoice) => {
      const member = members.find((m) => m.id === invoice.userId);
      return {
        email: member?.email,
        amount: invoice.amount,
        status: invoice.status,
        createdAt: invoice.createdAt.toISOString(),
        description: invoice.description,
      };
    });

    const header = ['Email', 'Amount', 'Status', 'Created At', 'Description'];

    const csv = [header, ...rows]
      .map((row) => Object.values(row).join(','))
      .join('\n');

    return csv;
  }
}
