
import apiClient from './client';

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export const register = async (fullName: string, email: string, password: string) => {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    fullName,
    email,
    password,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
};