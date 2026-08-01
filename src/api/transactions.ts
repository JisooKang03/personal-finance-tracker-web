import apiClient from './client';

export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  amount: number;
  type: 'Income' | 'Expense';
  description: string | null;
  date: string;
  receiptUrl: string | null;
  createdAt: string;
}

export interface TransactionRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  type: 'Income' | 'Expense';
  description?: string;
  date: string;
}

export const getTransactions = async (accountId?: number) => {
  const response = await apiClient.get<Transaction[]>('/transactions', {
    params: accountId ? { accountId } : {},
  });
  return response.data;
};

export const createTransaction = async (data: TransactionRequest) => {
  const response = await apiClient.post<Transaction>('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id: number, data: TransactionRequest) => {
  await apiClient.put(`/transactions/${id}`, data);
};

export const deleteTransaction = async (id: number) => {
  await apiClient.delete(`/transactions/${id}`);
};

export const uploadReceipt = async (transactionId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<Transaction>(
    `/transactions/${transactionId}/receipt`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
};

export const getReceiptUrl = async (transactionId: number) => {
  const response = await apiClient.get<{ url: string; expiresInMinutes: number }>(
    `/transactions/${transactionId}/receipt-url`
  );
  return response.data;
};