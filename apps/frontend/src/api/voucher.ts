import api from './axios';

export interface VoucherEntry {
  accountId: string;
  debit: number;
  credit: number;
  summary: string;
}

export interface Voucher {
  id: string;
  number: string;
  date: string;
  type: string;
  summary: string;
  status: string;
  creatorId: string;
  approverId: string | null;
  tenantId: string;
  creator?: { realName: string };
  approver?: { realName: string };
  entries: VoucherEntry[];
}

export const getVouchers = async (_tenantId: string) => {
  return api.get('/vouchers');
};

export const createVoucher = async (data: Omit<Voucher, 'id' | 'tenantId' | 'creatorId' | 'status'>) => {
  return api.post('/vouchers', data);
};

export const approveVoucher = async (id: string) => {
  return api.put(`/vouchers/${id}/approve`);
};

export const deleteVoucher = async (id: string) => {
  return api.delete(`/vouchers/${id}`);
};
