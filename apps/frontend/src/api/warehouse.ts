import api from './axios';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string;
  tenantId: string;
}

export const getWarehouses = async (_tenantId: string) => {
  return api.get('/warehouses');
};

export const createWarehouse = async (data: Omit<Warehouse, 'id' | 'tenantId'>) => {
  return api.post('/warehouses', data);
};

export const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
  return api.put(`/warehouses/${id}`, data);
};

export const deleteWarehouse = async (id: string) => {
  return api.delete(`/warehouses/${id}`);
};
