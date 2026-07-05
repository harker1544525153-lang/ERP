import api from './axios';

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions: string;
  tenantId: string;
}

export const getRoles = async (_tenantId: string) => {
  return api.get('/roles');
};

export const createRole = async (data: Omit<Role, 'id' | 'tenantId'>) => {
  return api.post('/roles', data);
};

export const updateRole = async (id: string, data: Partial<Role>) => {
  return api.put(`/roles/${id}`, data);
};

export const deleteRole = async (id: string) => {
  return api.delete(`/roles/${id}`);
};
