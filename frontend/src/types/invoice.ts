export enum InvoiceCategory {
  MEDICINE = "MEDICINE",
  EDUCATION = "EDUCATION",
  SPORT = "SPORT",
}

export enum InvoiceStatus {
  PAID = "PAID",
  IN_PROGRESS = "IN_PROGRESS",
  REJECTED = "REJECTED",
  WAITING_APPROVAL = "WAITING_APPROVAL",
}

export interface Invoice {
  id: string;
  userId: string;
  category: InvoiceCategory;
  amount: number;
  status: InvoiceStatus;
  description: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface Category {
  category: InvoiceCategory;
  limit: number;
  used: number;
}

export interface UserInvoiceData {
  invoices: Invoice[];
  categories: Category[];
}

export interface CreateInvoiceDto {
  amount: number;
  status: InvoiceStatus;
  description: string;
  s3Key: string | null;
  category: InvoiceCategory;
}

export interface CategoryDto {
  id: InvoiceCategory;
  limit: number;
}

export interface CategoriesDto {
  categories: CategoryDto[];
}

export interface GenerateReportDto {
  start: string;
  end: string;
}
