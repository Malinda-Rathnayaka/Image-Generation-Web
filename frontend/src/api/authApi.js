import axiosClient from './axiosClient';

export const registerUser = async (data) => {
  const response = await axiosClient.post('/api/v1/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axiosClient.post('/api/v1/auth/login', data);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosClient.get('/api/v1/auth/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put('/api/v1/auth/profile', data);
  return response.data;
};
