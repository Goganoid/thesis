import { InvoiceDto } from '../../dto/invoice.dto';
import { InvoiceEntity } from '../../entities/invoice.entity';

export const toInvoiceDto = (invoice: InvoiceEntity): InvoiceDto => {
  return {
    id: invoice.id,
    amount: invoice.amount,
    attachmentUrl: invoice.attachmentUrl,
    category: invoice.category,
    createdAt: invoice.createdAt,
    description: invoice.description,
    status: invoice.status,
    userId: invoice.userId,
  };
};
