import apiClient from './client';

export interface Category {
  id: number;
  name: string;
  type: 'Income' | 'Expense';
}

export const getCategories = async () => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
};