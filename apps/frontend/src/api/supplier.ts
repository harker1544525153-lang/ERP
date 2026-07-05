import api from './axios';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  shortName: string;
  contact: string;
  phone: string;
  address: string;
  taxCode: string;
  tenantId: string;
}

export const getSuppliers = async (_tenantId: string) => {
  return api.get('/suppliers');
};

export const createSupplier = async (data: Omit<Supplier, 'id' | 'tenantId'>) => {
  return api.post('/suppliers', data);
};

export const updateSupplier = async (id: string, data: Partial<Supplier>) => {
  return api.put(`/suppliers/${id}`, data);
};

export const deleteSupplier = async (id: string) => {
  return api.delete(`/suppliers/${id}`);
};
