import api from './axios';

export interface Receivable {
  id: string;
  customerId: string;
  saleOrderId: string;
  date: string;
  amount: number;
  receivedAmount: number;
  status: string;
  tenantId: string;
  customer?: { name: string };
  saleOrder?: { number: string };
}

export interface ReceivableSummary {
  total: number;
  pending: number;
  partial: number;
  paid: number;
}

export const getReceivables = async (_tenantId: string) => {
  return api.get('/receivables');
};

export const getReceivableSummary = async (_tenantId: string) => {
  return api.get('/receivables/summary');
};

export const createReceivable = async (data: Omit<Receivable, 'id' | 'tenantId' | 'receivedAmount' | 'status'>) => {
  return api.post('/receivables', data);
};

export const receivePayment = async (id: string, data: { amount: number }) => {
  return api.put(`/receivables/${id}/receive`, data);
};

export const deleteReceivable = async (id: string) => {
  return api.delete(`/receivables/${id}`);
};
