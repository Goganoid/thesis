import { InvoiceStatus } from '../types/invoice';

export const translateInvoiceStatus = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.PAID:
      return 'Paid';
    case InvoiceStatus.IN_PROGRESS:
      return 'In Progress';
    case InvoiceStatus.REJECTED:
      return 'Rejected';
    case InvoiceStatus.WAITING_APPROVAL:
      return 'Waiting Approval';
    default:
      return status;
  }
};
