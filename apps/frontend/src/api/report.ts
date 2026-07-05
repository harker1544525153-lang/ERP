import api from './axios';

export interface BalanceSheet {
  assets: { total: number; items: { code: string; name: string; balance: number }[] };
  liabilities: { total: number; items: { code: string; name: string; balance: number }[] };
  equity: { total: number; items: { code: string; name: string; balance: number }[] };
}

export interface IncomeStatement {
  income: { total: number; items: { code: string; name: string; amount: number }[] };
  expense: { total: number; items: { code: string; name: string; amount: number }[] };
  profit: number;
}

export const getBalanceSheet = async (_tenantId: string) => {
  return api.get('/reports/balance-sheet');
};

export const getIncomeStatement = async (_tenantId: string) => {
  return api.get('/reports/income-statement');
};

export const getInventoryReport = async (_tenantId: string) => {
  return api.get('/reports/inventory');
};

export const getPurchaseReport = async (_tenantId: string) => {
  return api.get('/reports/purchase');
};

export const getSaleReport = async (_tenantId: string) => {
  return api.get('/reports/sale');
};

export const getDashboard = async (_tenantId: string) => {
  return api.get('/dashboard');
};
