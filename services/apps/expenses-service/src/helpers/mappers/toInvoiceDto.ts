import { InvoiceDto } from '../../dto/invoice.dto';
import { InvoiceEntity } from '../../entities/invoice.entity';
import { S3Service } from '../../services/s3.service';

export const getInvoiceMapper = (s3Service: S3Service) => {
  const toInvoiceDto = async (invoice: InvoiceEntity): Promise<InvoiceDto> => {
    return {
      id: invoice.id,
      amount: invoice.amount,
      attachmentUrl: invoice.s3Key
        ? await s3Service.generatePresignedGetUrl(invoice.s3Key)
        : null,
      category: invoice.category,
      createdAt: invoice.createdAt,
      description: invoice.description,
      status: invoice.status,
      userId: invoice.userId,
    };
  };
  return { toInvoiceDto };
};
