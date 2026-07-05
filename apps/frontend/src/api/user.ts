import api from './axios';

export interface User {
  id: string;
  username: string;
  realName: string;
  orgId: string;
  roleId: string;
  email: string;
  phone: string;
  status: string;
  tenantId: string;
  organization?: { name: string };
  role?: { name: string };
}

export const getUsers = async (_tenantId: string) => {
  return api.get('/users');
};

export const createUser = async (data: Omit<User, 'id' | 'tenantId'>) => {
  return api.post('/users', data);
};

export const updateUser = async (id: string, data: Partial<User>) => {
  return api.put(`/users/${id}`, data);
};

export const deleteUser = async (id: string) => {
  return api.delete(`/users/${id}`);
};
