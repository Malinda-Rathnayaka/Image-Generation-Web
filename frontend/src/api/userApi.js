import axiosClient from './axiosClient';

export const fetchUsers = async (params = {}) => {
  const response = await axiosClient.get('/api/v1/users', { params });
  return response.data;
};

export const fetchAdminStats = async () => {
  const response = await axiosClient.get('/api/v1/users/stats');
  return response.data;
};

export const fetchUserById = async (id) => {
  const response = await axiosClient.get(`/api/v1/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosClient.put(`/api/v1/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosClient.delete(`/api/v1/users/${id}`);
  return response.data;
};
