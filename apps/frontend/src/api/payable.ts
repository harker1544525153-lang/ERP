import api from './axios';

export interface Payable {
  id: string;
  supplierId: string;
  purchaseOrderId: string;
  date: string;
  amount: number;
  paidAmount: number;
  status: string;
  tenantId: string;
  supplier?: { name: string };
  purchaseOrder?: { number: string };
}

export interface PayableSummary {
  total: number;
  pending: number;
  partial: number;
  paid: number;
}

export const getPayables = async (_tenantId: string) => {
  return api.get('/payables');
};

export const getPayableSummary = async (_tenantId: string) => {
  return api.get('/payables/summary');
};

export const createPayable = async (data: Omit<Payable, 'id' | 'tenantId' | 'paidAmount' | 'status'>) => {
  return api.post('/payables', data);
};

export const makePayment = async (id: string, data: { amount: number }) => {
  return api.put(`/payables/${id}/pay`, data);
};

export const deletePayable = async (id: string) => {
  return api.delete(`/payables/${id}`);
};
