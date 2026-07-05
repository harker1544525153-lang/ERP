import api from './axios';

export interface Inventory {
  id: string;
  warehouseId: string;
  materialId: string;
  quantity: number;
  tenantId: string;
  warehouse?: { name: string };
  material?: { name: string; spec: string; unit: string; price: number };
}

export interface InventoryTransfer {
  id: string;
  number: string;
  date: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  fromWarehouse?: { name: string };
  toWarehouse?: { name: string };
  creator?: { realName: string };
}

export const getInventories = async (_tenantId: string) => {
  return api.get('/inventories');
};

export const getTransfers = async (_tenantId: string) => {
  return api.get('/transfers');
};

export const createTransfer = async (data: Omit<InventoryTransfer, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/transfers', data);
};

export const approveTransfer = async (id: string) => {
  return api.put(`/transfers/${id}/approve`);
};

export const deleteTransfer = async (id: string) => {
  return api.delete(`/transfers/${id}`);
};
