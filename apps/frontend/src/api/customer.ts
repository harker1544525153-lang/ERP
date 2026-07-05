import api from './axios';

export interface Customer {
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

export const getCustomers = async (_tenantId: string) => {
  return api.get('/customers');
};

export const createCustomer = async (data: Omit<Customer, 'id' | 'tenantId'>) => {
  return api.post('/customers', data);
};

export const updateCustomer = async (id: string, data: Partial<Customer>) => {
  return api.put(`/customers/${id}`, data);
};

export const deleteCustomer = async (id: string) => {
  return api.delete(`/customers/${id}`);
};
