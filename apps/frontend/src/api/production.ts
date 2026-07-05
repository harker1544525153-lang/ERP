import api from './axios';

export interface ProductionPickingItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string };
  quantity: number;
}

export interface ProductionPicking {
  id: string;
  number: string;
  date: string;
  productionOrderId: string;
  warehouseId: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  productionOrder?: { number: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: ProductionPickingItem[];
}

export const getProductionPickings = async (_tenantId: string) => {
  return api.get('/production-pickings');
};

export const createProductionPicking = async (data: Omit<ProductionPicking, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/production-pickings', data);
};

export const approveProductionPicking = async (id: string) => {
  return api.put(`/production-pickings/${id}/approve`);
};

export const completeProductionPicking = async (id: string) => {
  return api.put(`/production-pickings/${id}/complete`);
};

export const deleteProductionPicking = async (id: string) => {
  return api.delete(`/production-pickings/${id}`);
};

export interface ProductionReturnItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string };
  quantity: number;
  reason: string;
}

export interface ProductionReturn {
  id: string;
  number: string;
  date: string;
  productionOrderId: string;
  warehouseId: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  productionOrder?: { number: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: ProductionReturnItem[];
}

export const getProductionReturns = async (_tenantId: string) => {
  return api.get('/production-returns');
};

export const createProductionReturn = async (data: Omit<ProductionReturn, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/production-returns', data);
};

export const approveProductionReturn = async (id: string) => {
  return api.put(`/production-returns/${id}/approve`);
};

export const completeProductionReturn = async (id: string) => {
  return api.put(`/production-returns/${id}/complete`);
};

export const deleteProductionReturn = async (id: string) => {
  return api.delete(`/production-returns/${id}`);
};