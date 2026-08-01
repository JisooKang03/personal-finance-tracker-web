import apiClient from './client';

export interface Budget {
  id: number;
  categoryId: number;
  categoryName: string;
  monthlyLimit: number;
  month: number;
  year: number;
  amountSpent: number;
  remainingAmount: number;
}

export interface BudgetRequest {
  categoryId: number;
  monthlyLimit: number;
  month: number;
  year: number;
}

export const getBudgets = async (month?: number, year?: number) => {
  const response = await apiClient.get<Budget[]>('/budgets', {
    params: { month, year },
  });
  return response.data;
};

export const createBudget = async (data: BudgetRequest) => {
  const response = await apiClient.post<Budget>('/budgets', data);
  return response.data;
};

export const deleteBudget = async (id: number) => {
  await apiClient.delete(`/budgets/${id}`);
};