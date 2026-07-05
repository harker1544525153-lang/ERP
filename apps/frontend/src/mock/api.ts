import {
  mockUser,
  mockOrganizations,
  mockRoles,
  mockUsers,
  mockAccounts,
  mockAccountBalance,
  mockCustomers,
  mockSuppliers,
  mockMaterials,
  mockWarehouses,
  mockVouchers,
  mockPurchaseOrders,
  mockSaleOrders,
  mockInventories,
  mockTransfers,
  mockReceivables,
  mockReceivableSummary,
  mockPayables,
  mockPayableSummary,
  mockBalanceSheet,
  mockIncomeStatement,
  mockInventoryReport,
  mockPurchaseReport,
  mockSaleReport,
  mockDashboard,
} from './data';

const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (values: { username: string; password: string }) => {
  await delay();
  const validUsers = ['admin', 'finance', 'purchase', 'sale', 'warehouse', 'production', 'audit', 'hr', 'purchase2', 'sale2'];
  if (validUsers.includes(values.username) && values.password === '123456') {
    const user = mockUsers.find(u => u.username === values.username) || mockUser;
    return { message: '登录成功', data: { access_token: 'mock-token', user } };
  }
  throw new Error('账号或密码错误');
};

export const getOrganizations = async (tenantId: string) => {
  await delay();
  return { data: mockOrganizations.filter(o => o.tenantId === tenantId) };
};

export const getOrganizationTree = async (tenantId: string) => {
  await delay();
  const orgs = mockOrganizations.filter(o => o.tenantId === tenantId);
  const tree = orgs.filter(o => !o.parentId).map(o => ({
    ...o,
    children: orgs.filter(c => c.parentId === o.id),
  }));
  return { data: tree };
};

export const createOrganization = async (data: any) => {
  await delay();
  const org = { id: `org-${Date.now()}`, ...data };
  return { message: '新增组织成功', data: org };
};

export const updateOrganization = async (id: string, data: any) => {
  await delay();
  return { message: '更新组织成功', data: { id, ...data } };
};

export const deleteOrganization = async (id: string) => {
  await delay();
  return { message: '删除组织成功', data: { id } };
};

export const getRoles = async (tenantId: string) => {
  await delay();
  return { data: mockRoles.filter(r => r.tenantId === tenantId) };
};

export const createRole = async (data: any) => {
  await delay();
  return { message: '新增角色成功', data: { id: `role-${Date.now()}`, ...data } };
};

export const updateRole = async (id: string, data: any) => {
  await delay();
  return { message: '更新角色成功', data: { id, ...data } };
};

export const deleteRole = async (id: string) => {
  await delay();
  return { message: '删除角色成功', data: { id } };
};

export const getUsers = async (tenantId: string) => {
  await delay();
  return { data: mockUsers.filter(u => u.tenantId === tenantId) };
};

export const createUser = async (data: any) => {
  await delay();
  return { message: '新增用户成功', data: { id: `user-${Date.now()}`, ...data } };
};

export const updateUser = async (id: string, data: any) => {
  await delay();
  return { message: '更新用户成功', data: { id, ...data } };
};

export const deleteUser = async (id: string) => {
  await delay();
  return { message: '删除用户成功', data: { id } };
};

export const getAccounts = async (tenantId: string) => {
  await delay();
  return { data: mockAccounts.filter(a => a.tenantId === tenantId) };
};

export const getAccountTree = async (tenantId: string) => {
  await delay();
  const accs = mockAccounts.filter(a => a.tenantId === tenantId);
  const tree = accs.filter(a => !a.parentId).map(a => ({
    ...a,
    children: accs.filter(c => c.parentId === a.id),
  }));
  return { data: tree };
};

export const getAccountBalance = async (_tenantId: string) => {
  await delay();
  return { data: mockAccountBalance };
};

export const createAccount = async (data: any) => {
  await delay();
  return { message: '新增科目成功', data: { id: `acc-${Date.now()}`, ...data } };
};

export const updateAccount = async (id: string, data: any) => {
  await delay();
  return { message: '更新科目成功', data: { id, ...data } };
};

export const deleteAccount = async (id: string) => {
  await delay();
  return { message: '删除科目成功', data: { id } };
};

export const getCustomers = async (tenantId: string) => {
  await delay();
  return { data: mockCustomers.filter(c => c.tenantId === tenantId) };
};

export const createCustomer = async (data: any) => {
  await delay();
  return { message: '新增客户成功', data: { id: `cust-${Date.now()}`, ...data } };
};

export const updateCustomer = async (id: string, data: any) => {
  await delay();
  return { message: '更新客户成功', data: { id, ...data } };
};

export const deleteCustomer = async (id: string) => {
  await delay();
  return { message: '删除客户成功', data: { id } };
};

export const getSuppliers = async (tenantId: string) => {
  await delay();
  return { data: mockSuppliers.filter(s => s.tenantId === tenantId) };
};

export const createSupplier = async (data: any) => {
  await delay();
  return { message: '新增供应商成功', data: { id: `sup-${Date.now()}`, ...data } };
};

export const updateSupplier = async (id: string, data: any) => {
  await delay();
  return { message: '更新供应商成功', data: { id, ...data } };
};

export const deleteSupplier = async (id: string) => {
  await delay();
  return { message: '删除供应商成功', data: { id } };
};

export const getMaterials = async (tenantId: string) => {
  await delay();
  return { data: mockMaterials.filter(m => m.tenantId === tenantId) };
};

export const createMaterial = async (data: any) => {
  await delay();
  return { message: '新增物料成功', data: { id: `mat-${Date.now()}`, ...data } };
};

export const updateMaterial = async (id: string, data: any) => {
  await delay();
  return { message: '更新物料成功', data: { id, ...data } };
};

export const deleteMaterial = async (id: string) => {
  await delay();
  return { message: '删除物料成功', data: { id } };
};

export const getWarehouses = async (tenantId: string) => {
  await delay();
  return { data: mockWarehouses.filter(w => w.tenantId === tenantId) };
};

export const createWarehouse = async (data: any) => {
  await delay();
  return { message: '新增仓库成功', data: { id: `wh-${Date.now()}`, ...data } };
};

export const updateWarehouse = async (id: string, data: any) => {
  await delay();
  return { message: '更新仓库成功', data: { id, ...data } };
};

export const deleteWarehouse = async (id: string) => {
  await delay();
  return { message: '删除仓库成功', data: { id } };
};

export const getVouchers = async (tenantId: string) => {
  await delay();
  return { data: mockVouchers.filter(v => v.tenantId === tenantId) };
};

export const createVoucher = async (data: any) => {
  await delay();
  return { message: '新增凭证成功', data: { id: `vou-${Date.now()}`, ...data } };
};

export const approveVoucher = async (id: string, data: any) => {
  await delay();
  return { message: '审核凭证成功', data: { id, ...data } };
};

export const deleteVoucher = async (id: string) => {
  await delay();
  return { message: '删除凭证成功', data: { id } };
};

export const getPurchaseOrders = async (tenantId: string) => {
  await delay();
  return { data: mockPurchaseOrders.filter(po => po.tenantId === tenantId) };
};

export const createPurchaseOrder = async (data: any) => {
  await delay();
  return { message: '新增采购订单成功', data: { id: `po-${Date.now()}`, ...data } };
};

export const approvePurchaseOrder = async (id: string, data: any) => {
  await delay();
  return { message: '审核采购订单成功', data: { id, ...data } };
};

export const receivePurchaseOrder = async (id: string, data: any) => {
  await delay();
  return { message: '采购入库成功', data: { id, ...data } };
};

export const deletePurchaseOrder = async (id: string) => {
  await delay();
  return { message: '删除采购订单成功', data: { id } };
};

export const getSaleOrders = async (tenantId: string) => {
  await delay();
  return { data: mockSaleOrders.filter(so => so.tenantId === tenantId) };
};

export const createSaleOrder = async (data: any) => {
  await delay();
  return { message: '新增销售订单成功', data: { id: `so-${Date.now()}`, ...data } };
};

export const approveSaleOrder = async (id: string, data: any) => {
  await delay();
  return { message: '审核销售订单成功', data: { id, ...data } };
};

export const shipSaleOrder = async (id: string, data: any) => {
  await delay();
  return { message: '销售出库成功', data: { id, ...data } };
};

export const deleteSaleOrder = async (id: string) => {
  await delay();
  return { message: '删除销售订单成功', data: { id } };
};

export const getInventories = async (tenantId: string) => {
  await delay();
  return { data: mockInventories.filter(i => i.tenantId === tenantId) };
};

export const getTransfers = async (tenantId: string) => {
  await delay();
  return { data: mockTransfers.filter(t => t.tenantId === tenantId) };
};

export const createTransfer = async (data: any) => {
  await delay();
  return { message: '新增调拨单成功', data: { id: `tf-${Date.now()}`, ...data } };
};

export const approveTransfer = async (id: string, data: any) => {
  await delay();
  return { message: '审核调拨单成功', data: { id, ...data } };
};

export const deleteTransfer = async (id: string) => {
  await delay();
  return { message: '删除调拨单成功', data: { id } };
};

export const getReceivables = async (tenantId: string) => {
  await delay();
  return { data: mockReceivables.filter(r => r.tenantId === tenantId) };
};

export const getReceivableSummary = async (_tenantId: string) => {
  await delay();
  return { data: mockReceivableSummary };
};

export const createReceivable = async (data: any) => {
  await delay();
  return { message: '新增应收款成功', data: { id: `rec-${Date.now()}`, ...data } };
};

export const receivePayment = async (id: string, data: any) => {
  await delay();
  return { message: '收款成功', data: { id, ...data } };
};

export const deleteReceivable = async (id: string) => {
  await delay();
  return { message: '删除应收款成功', data: { id } };
};

export const getPayables = async (tenantId: string) => {
  await delay();
  return { data: mockPayables.filter(p => p.tenantId === tenantId) };
};

export const getPayableSummary = async (_tenantId: string) => {
  await delay();
  return { data: mockPayableSummary };
};

export const createPayable = async (data: any) => {
  await delay();
  return { message: '新增应付款成功', data: { id: `pay-${Date.now()}`, ...data } };
};

export const makePayment = async (id: string, data: any) => {
  await delay();
  return { message: '付款成功', data: { id, ...data } };
};

export const deletePayable = async (id: string) => {
  await delay();
  return { message: '删除应付款成功', data: { id } };
};

export const getBalanceSheet = async (_tenantId: string) => {
  await delay();
  return { data: mockBalanceSheet };
};

export const getIncomeStatement = async (_tenantId: string) => {
  await delay();
  return { data: mockIncomeStatement };
};

export const getInventoryReport = async (_tenantId: string) => {
  await delay();
  return { data: mockInventoryReport };
};

export const getPurchaseReport = async (_tenantId: string) => {
  await delay();
  return { data: mockPurchaseReport };
};

export const getSaleReport = async (_tenantId: string) => {
  await delay();
  return { data: mockSaleReport };
};

export const getDashboard = async (_tenantId: string) => {
  await delay();
  return { data: mockDashboard };
};