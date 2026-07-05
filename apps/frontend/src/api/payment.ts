import api from './axios';

export interface Payment {
  id: string;
  number: string;
  date: string;
  supplierId: string;
  payableId: string;
  amount: number;
  bankAccount: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  supplier?: { name: string };
  payable?: { number: string; amount: number };
  voucher?: { number: string };
  creator?: { realName: string };
}

export const getPayments = async (_tenantId: string) => {
  return api.get('/payments');
};

export const createPayment = async (data: Omit<Payment, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/payments', data);
};

export const approvePayment = async (id: string) => {
  return api.put(`/payments/${id}/approve`);
};

export const completePayment = async (id: string) => {
  return api.put(`/payments/${id}/complete`);
};

export const deletePayment = async (id: string) => {
  return api.delete(`/payments/${id}`);
};