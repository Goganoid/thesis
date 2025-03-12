import { expensesApiProvider } from "./api";
import { CreateInvoiceDto, UserInvoiceData } from "../types/invoice";

export const invoiceApi = {
  getUserInvoices: async (year: number) => {
    const response = await expensesApiProvider.get<UserInvoiceData>(
      "/invoices",
      {
        data: { year },
      }
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
    const response = await expensesApiProvider.delete<object>(
      `/invoices/invoices/${id}`
    );
    return response.data;
  },
};
