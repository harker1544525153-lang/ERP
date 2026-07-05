import api from './axios';

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string; price: number };
  quantity: number;
  unitPrice: number;
  receivedQty: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  date: string;
  supplierId: string;
  warehouseId: string;
  totalAmount: number;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  supplier?: { name: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: PurchaseOrderItem[];
}

export const getPurchaseOrders = async (_tenantId: string) => {
  return api.get('/purchase-orders');
};

export const createPurchaseOrder = async (data: Omit<PurchaseOrder, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/purchase-orders', data);
};

export const approvePurchaseOrder = async (id: string) => {
  return api.put(`/purchase-orders/${id}/approve`);
};

export const receivePurchaseOrder = async (id: string) => {
  return api.put(`/purchase-orders/${id}/receive`);
};

export const deletePurchaseOrder = async (id: string) => {
  return api.delete(`/purchase-orders/${id}`);
};
