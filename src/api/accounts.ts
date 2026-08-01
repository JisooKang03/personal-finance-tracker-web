import apiClient from './client';

export interface Account {
  id: number;
  name: string;
  balance: number;
  createdAt: string;
}

export const getAccounts = async () => {
  const response = await apiClient.get<Account[]>('/accounts');
  return response.data;
};

export const createAccount = async (name: string, balance: number) => {
  const response = await apiClient.post<Account>('/accounts', { name, balance });
  return response.data;
};

export const updateAccount = async (id: number, name: string, balance: number) => {
  await apiClient.put(`/accounts/${id}`, { name, balance });
};

export const deleteAccount = async (id: number) => {
  await apiClient.delete(`/accounts/${id}`);
};