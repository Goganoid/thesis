import {
  CreateInvoiceDto,
  Invoice,
  InvoiceCategory,
  InvoiceStatus,
  UserInvoiceData,
  CategoriesDto,
} from "../types/invoice";
import { transformQueryParams } from "../utils/transformQueryParams";
import { expensesApiProvider } from "./api";

export const invoiceApi = {
  getUserInvoices: async (year: number, status?: InvoiceCategory[]) => {
    const queryParams = transformQueryParams({ year, status });
    const response = await expensesApiProvider.get<UserInvoiceData>(
      `/invoices?${queryParams}`
    );
    return response.data;
  },

  createInvoice: async (data: CreateInvoiceDto) => {
    const response = await expensesApiProvider.post<object>(
      "/invoices/invoices",
      data
    );
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await expensesApiProvider.delete<unknown>(
      `/invoices/invoices/${id}`
    );
    return response.data;
  },

  getPresignedUrl: async (fileType: string, hash: string) => {
    const response = await expensesApiProvider.post<{
      presignedUrl: string;
      key: string;
    }>("/invoices/presigned-url", { fileType, hash });
    return response.data;
  },

  admin: {
    getAllInvoices: async (year: number, status?: InvoiceStatus[]) => {
      const queryParams = transformQueryParams({ year, status });
      console.log(queryParams);
      const response = await expensesApiProvider.get<Invoice[]>(
        `/invoices/admin/invoices?${queryParams}`
      );
      return response.data;
    },
    updateInvoiceStatus: async (invoiceId: string, status: InvoiceStatus) => {
      const response = await expensesApiProvider.put<unknown>(
        `/invoices/admin/invoices/${invoiceId}/status`,
        { status }
      );
      return response.data;
    },
  },

  async getCategories() {
    const response = await expensesApiProvider.get<CategoriesDto>(
      "/invoices/admin/categories"
    );
    return response.data;
  },

  async updateCategoryLimit(category: InvoiceCategory, limit: number) {
    const response = await expensesApiProvider.put(
      `/invoices/admin/categories/limits`,
      { limit, category }
    );
    return response.data;
  },
};
