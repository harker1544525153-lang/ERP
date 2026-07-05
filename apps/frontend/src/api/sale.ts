import api from './axios';

export interface SaleOrderItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string; price: number };
  quantity: number;
  unitPrice: number;
  shippedQty: number;
}

export interface SaleOrder {
  id: string;
  number: string;
  date: string;
  customerId: string;
  warehouseId: string;
  totalAmount: number;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  customer?: { name: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: SaleOrderItem[];
}

export const getSaleOrders = async (_tenantId: string) => {
  return api.get('/sale-orders');
};

export const createSaleOrder = async (data: Omit<SaleOrder, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/sale-orders', data);
};

export const approveSaleOrder = async (id: string) => {
  return api.put(`/sale-orders/${id}/approve`);
};

export const shipSaleOrder = async (id: string) => {
  return api.put(`/sale-orders/${id}/ship`);
};

export const deleteSaleOrder = async (id: string) => {
  return api.delete(`/sale-orders/${id}`);
};
