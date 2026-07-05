import api from './axios';

export interface SaleDeliveryItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string; price: number };
  quantity: number;
  unitPrice: number;
}

export interface SaleDelivery {
  id: string;
  number: string;
  date: string;
  saleOrderId: string;
  customerId: string;
  warehouseId: string;
  totalAmount: number;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  saleOrder?: { number: string };
  customer?: { name: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: SaleDeliveryItem[];
}

export const getSaleDeliveries = async (_tenantId: string) => {
  return api.get('/sale-deliveries');
};

export const createSaleDelivery = async (data: Omit<SaleDelivery, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/sale-deliveries', data);
};

export const approveSaleDelivery = async (id: string) => {
  return api.put(`/sale-deliveries/${id}/approve`);
};

export const completeSaleDelivery = async (id: string) => {
  return api.put(`/sale-deliveries/${id}/complete`);
};

export const deleteSaleDelivery = async (id: string) => {
  return api.delete(`/sale-deliveries/${id}`);
};