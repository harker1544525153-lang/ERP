import api from './axios';

export interface PurchaseReceiptItem {
  id: string;
  materialId: string;
  material?: { name: string; spec: string; unit: string; price: number };
  quantity: number;
  unitPrice: number;
}

export interface PurchaseReceipt {
  id: string;
  number: string;
  date: string;
  purchaseOrderId: string;
  supplierId: string;
  warehouseId: string;
  totalAmount: number;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  purchaseOrder?: { number: string };
  supplier?: { name: string };
  warehouse?: { name: string };
  creator?: { realName: string };
  items: PurchaseReceiptItem[];
}

export const getPurchaseReceipts = async (_tenantId: string) => {
  return api.get('/purchase-receipts');
};

export const createPurchaseReceipt = async (data: Omit<PurchaseReceipt, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/purchase-receipts', data);
};

export const approvePurchaseReceipt = async (id: string) => {
  return api.put(`/purchase-receipts/${id}/approve`);
};

export const completePurchaseReceipt = async (id: string) => {
  return api.put(`/purchase-receipts/${id}/complete`);
};

export const deletePurchaseReceipt = async (id: string) => {
  return api.delete(`/purchase-receipts/${id}`);
};