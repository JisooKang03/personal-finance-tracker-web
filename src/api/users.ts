import apiClient from './client';

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ url: string }>('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getProfilePhotoUrl = async () => {
  const response = await apiClient.get<{ url: string }>('/users/me/photo');
  return response.data;
};

export const deleteProfilePhoto = async () => {
  await apiClient.delete('/users/me/photo');
};