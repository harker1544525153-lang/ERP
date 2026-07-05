import api from './axios';

export interface Account {
  id: string;
  code: string;
  name: string;
  category: string;
  type: string;
  level: number;
  parentId: string | null;
  tenantId: string;
  parent?: { name: string };
  children?: Account[];
}

export interface AccountBalance {
  id: string;
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance: number;
}

export const getAccounts = async (_tenantId: string) => {
  return api.get('/accounts');
};

export const getAccountTree = async (_tenantId: string) => {
  return api.get('/accounts/tree');
};

export const getAccountBalance = async (_tenantId: string) => {
  return api.get('/accounts/balance');
};

export const createAccount = async (data: Omit<Account, 'id' | 'tenantId'>) => {
  return api.post('/accounts', data);
};

export const updateAccount = async (id: string, data: Partial<Account>) => {
  return api.put(`/accounts/${id}`, data);
};

export const deleteAccount = async (id: string) => {
  return api.delete(`/accounts/${id}`);
};
