import { InvoiceEntity } from '../entities/invoice.entity';
import { InvoiceStatus } from '../enums/invoice.status';

export const sumPaidInvoices = (invoices: InvoiceEntity[]) => {
  const currentYearLimits = invoices.filter((invoice) =>
    [
      InvoiceStatus.IN_PROGRESS,
      InvoiceStatus.PAID,
      InvoiceStatus.WAITING_APPROVAL,
    ].includes(invoice.status),
  );
  return currentYearLimits.reduce((sum, invoice) => sum + invoice.amount, 0);
};
