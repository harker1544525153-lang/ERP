import api from './axios';

export interface Receipt {
  id: string;
  number: string;
  date: string;
  customerId: string;
  receivableId: string;
  amount: number;
  bankAccount: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  customer?: { name: string };
  receivable?: { number: string; amount: number };
  voucher?: { number: string };
  creator?: { realName: string };
}

export const getReceipts = async (_tenantId: string) => {
  return api.get('/receipts');
};

export const createReceipt = async (data: Omit<Receipt, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/receipts', data);
};

export const approveReceipt = async (id: string) => {
  return api.put(`/receipts/${id}/approve`);
};

export const completeReceipt = async (id: string) => {
  return api.put(`/receipts/${id}/complete`);
};

export const deleteReceipt = async (id: string) => {
  return api.delete(`/receipts/${id}`);
};