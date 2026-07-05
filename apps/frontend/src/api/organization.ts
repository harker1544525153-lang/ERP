import api from './axios';

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: string;
  parentId: string | null;
  tenantId: string;
  parent?: { name: string };
  children?: Organization[];
}

export const getOrganizations = async (_tenantId: string) => {
  return api.get('/organizations');
};

export const getOrganizationTree = async (_tenantId: string) => {
  return api.get('/organizations/tree');
};

export const createOrganization = async (data: Omit<Organization, 'id' | 'tenantId'>) => {
  return api.post('/organizations', data);
};

export const updateOrganization = async (id: string, data: Partial<Organization>) => {
  return api.put(`/organizations/${id}`, data);
};

export const deleteOrganization = async (id: string) => {
  return api.delete(`/organizations/${id}`);
};
