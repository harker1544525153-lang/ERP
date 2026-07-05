export const mockUser = {
  id: 'user-1',
  username: 'admin',
  realName: '张总经理',
  orgId: 'org-1',
  roleId: 'role-1',
  email: 'zhangzong@huayou.com',
  phone: '13800138000',
  status: 'active',
  tenantId: 'tenant-1',
  organization: { name: '华优科技集团有限公司' },
  role: { name: '超级管理员' }
};

export const mockOrganizations = [
  { id: 'org-1', name: '华优科技集团有限公司', code: 'HUAYOU', type: 'company', parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'org-2', name: '财务部', code: 'FINANCE', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-3', name: '采购部', code: 'PURCHASE', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-4', name: '销售部', code: 'SALE', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-5', name: '仓储物流部', code: 'WAREHOUSE', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-6', name: '生产制造部', code: 'PRODUCTION', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-7', name: '技术研发部', code: 'TECH', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-8', name: '市场品牌部', code: 'MARKET', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-9', name: '人力资源部', code: 'HR', type: 'department', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-10', name: '上海分公司', code: 'SHANGHAI', type: 'branch', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-11', name: '广州分公司', code: 'GUANGZHOU', type: 'branch', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
  { id: 'org-12', name: '深圳研发中心', code: 'SHENZHEN_RD', type: 'branch', parentId: 'org-1', tenantId: 'tenant-1', parent: { name: '华优科技集团有限公司' } },
];

export const mockRoles = [
  { id: 'role-1', name: '超级管理员', code: 'admin', permissions: JSON.stringify(['*']), tenantId: 'tenant-1' },
  { id: 'role-2', name: '财务主管', code: 'finance', permissions: JSON.stringify(['account:view', 'account:edit', 'voucher:view', 'voucher:edit', 'report:view', 'receivable:view', 'payable:view', 'approval:view']), tenantId: 'tenant-1' },
  { id: 'role-3', name: '采购专员', code: 'purchase', permissions: JSON.stringify(['supplier:view', 'purchase:view', 'purchase:edit', 'material:view', 'warehouse:view', 'approval:submit']), tenantId: 'tenant-1' },
  { id: 'role-4', name: '销售专员', code: 'sale', permissions: JSON.stringify(['customer:view', 'sale:view', 'sale:edit', 'material:view', 'warehouse:view', 'approval:submit']), tenantId: 'tenant-1' },
  { id: 'role-5', name: '仓储主管', code: 'warehouse', permissions: JSON.stringify(['warehouse:view', 'inventory:view', 'purchase:view', 'sale:view', 'approval:view']), tenantId: 'tenant-1' },
  { id: 'role-6', name: '生产主管', code: 'production', permissions: JSON.stringify(['material:view', 'inventory:view', 'production:view', 'production:edit', 'approval:submit']), tenantId: 'tenant-1' },
  { id: 'role-7', name: '人事专员', code: 'hr', permissions: JSON.stringify(['user:view', 'organization:view']), tenantId: 'tenant-1' },
];

export const mockUsers = [
  { id: 'user-1', username: 'admin', realName: '张总经理', orgId: 'org-1', roleId: 'role-1', email: 'zhangzong@huayou.com', phone: '13800138000', status: 'active', tenantId: 'tenant-1', organization: { name: '华优科技集团有限公司' }, role: { name: '超级管理员' } },
  { id: 'user-2', username: 'finance', realName: '李财务总监', orgId: 'org-2', roleId: 'role-2', email: 'liwu@huayou.com', phone: '13800138001', status: 'active', tenantId: 'tenant-1', organization: { name: '财务部' }, role: { name: '财务主管' } },
  { id: 'user-3', username: 'purchase', realName: '王采购经理', orgId: 'org-3', roleId: 'role-3', email: 'wangcg@huayou.com', phone: '13800138002', status: 'active', tenantId: 'tenant-1', organization: { name: '采购部' }, role: { name: '采购专员' } },
  { id: 'user-4', username: 'sale', realName: '赵销售总监', orgId: 'org-4', roleId: 'role-4', email: 'zhaoxs@huayou.com', phone: '13800138003', status: 'active', tenantId: 'tenant-1', organization: { name: '销售部' }, role: { name: '销售专员' } },
  { id: 'user-5', username: 'warehouse', realName: '孙仓储主管', orgId: 'org-5', roleId: 'role-5', email: 'suncc@huayou.com', phone: '13800138004', status: 'active', tenantId: 'tenant-1', organization: { name: '仓储物流部' }, role: { name: '仓储主管' } },
  { id: 'user-6', username: 'production', realName: '周生产经理', orgId: 'org-6', roleId: 'role-6', email: 'zhousc@huayou.com', phone: '13800138005', status: 'active', tenantId: 'tenant-1', organization: { name: '生产制造部' }, role: { name: '生产主管' } },
  { id: 'user-7', username: 'audit', realName: '吴审计专员', orgId: 'org-2', roleId: 'role-2', email: 'wusj@huayou.com', phone: '13800138006', status: 'active', tenantId: 'tenant-1', organization: { name: '财务部' }, role: { name: '财务主管' } },
  { id: 'user-8', username: 'hr', realName: '郑人事主管', orgId: 'org-9', roleId: 'role-7', email: 'zhengrs@huayou.com', phone: '13800138007', status: 'active', tenantId: 'tenant-1', organization: { name: '人力资源部' }, role: { name: '人事专员' } },
  { id: 'user-9', username: 'purchase2', realName: '陈采购专员', orgId: 'org-3', roleId: 'role-3', email: 'chencg@huayou.com', phone: '13800138008', status: 'active', tenantId: 'tenant-1', organization: { name: '采购部' }, role: { name: '采购专员' } },
  { id: 'user-10', username: 'sale2', realName: '刘销售专员', orgId: 'org-4', roleId: 'role-4', email: 'liuxs@huayou.com', phone: '13800138009', status: 'active', tenantId: 'tenant-1', organization: { name: '销售部' }, role: { name: '销售专员' } },
];

export const mockAccounts = [
  { id: 'acc-1', code: '1001', name: '库存现金', category: 'asset', type: 'cash', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-2', code: '1002', name: '银行存款', category: 'asset', type: 'bank', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-3', code: '1122', name: '应收账款', category: 'asset', type: 'receivable', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-4', code: '1403', name: '原材料', category: 'asset', type: 'inventory', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-5', code: '2001', name: '短期借款', category: 'liability', type: 'loan', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-6', code: '2202', name: '应付账款', category: 'liability', type: 'payable', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-7', code: '4001', name: '实收资本', category: 'equity', type: 'capital', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-8', code: '6001', name: '主营业务收入', category: 'income', type: 'revenue', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
  { id: 'acc-9', code: '6601', name: '销售费用', category: 'expense', type: 'sale', level: 1, parentId: null, tenantId: 'tenant-1', parent: null },
];

export const mockAccountBalance = [
  { code: '1001', name: '库存现金', debit: 50000, credit: 0, balance: 50000 },
  { code: '1002', name: '银行存款', debit: 2000000, credit: 0, balance: 2000000 },
  { code: '1122', name: '应收账款', debit: 500000, credit: 0, balance: 500000 },
  { code: '1403', name: '原材料', debit: 300000, credit: 0, balance: 300000 },
  { code: '2001', name: '短期借款', debit: 0, credit: 1000000, balance: -1000000 },
  { code: '2202', name: '应付账款', debit: 0, credit: 300000, balance: -300000 },
  { code: '4001', name: '实收资本', debit: 0, credit: 2000000, balance: -2000000 },
  { code: '6001', name: '主营业务收入', debit: 0, credit: 1500000, balance: -1500000 },
  { code: '6601', name: '销售费用', debit: 200000, credit: 0, balance: 200000 },
];

export const mockCustomers = [
  { id: 'cust-1', code: 'C001', name: '上海贸易有限公司', shortName: '上海贸易', contact: '王经理', phone: '021-12345678', address: '上海市浦东新区', taxCode: '91310000MA12345678', tenantId: 'tenant-1' },
  { id: 'cust-2', code: 'C002', name: '广州科技有限公司', shortName: '广州科技', contact: '李总监', phone: '020-87654321', address: '广州市天河区', taxCode: '91440000MA87654321', tenantId: 'tenant-1' },
  { id: 'cust-3', code: 'C003', name: '北京实业集团', shortName: '北京实业', contact: '张总', phone: '010-11112222', address: '北京市朝阳区', taxCode: '91110000MA11112222', tenantId: 'tenant-1' },
];

export const mockSuppliers = [
  { id: 'sup-1', code: 'S001', name: '深圳供应商有限公司', shortName: '深圳供应', contact: '陈经理', phone: '0755-12345678', address: '深圳市南山区', taxCode: '91440300MA12345678', tenantId: 'tenant-1' },
  { id: 'sup-2', code: 'S002', name: '杭州材料有限公司', shortName: '杭州材料', contact: '周经理', phone: '0571-87654321', address: '杭州市西湖区', taxCode: '91330000MA87654321', tenantId: 'tenant-1' },
  { id: 'sup-3', code: 'S003', name: '南京零部件公司', shortName: '南京零件', contact: '吴经理', phone: '025-22223333', address: '南京市鼓楼区', taxCode: '91320000MA22223333', tenantId: 'tenant-1' },
];

export const mockMaterials = [
  { id: 'mat-1', code: 'M001', name: '电子元器件A', spec: '型号X100', unit: '个', category: '电子产品', price: 10.50, tenantId: 'tenant-1' },
  { id: 'mat-2', code: 'M002', name: '金属原材料', spec: '规格20mm', unit: 'kg', category: '金属材料', price: 25.80, tenantId: 'tenant-1' },
  { id: 'mat-3', code: 'M003', name: '包装材料', spec: '标准尺寸', unit: '件', category: '包装', price: 5.20, tenantId: 'tenant-1' },
  { id: 'mat-4', code: 'M004', name: '塑料件', spec: '型号P200', unit: '个', category: '塑料制品', price: 8.00, tenantId: 'tenant-1' },
];

export const mockWarehouses = [
  { id: 'wh-1', code: 'WH001', name: '主仓库', address: '工业园区A栋', tenantId: 'tenant-1' },
  { id: 'wh-2', code: 'WH002', name: '备用仓库', address: '工业园区B栋', tenantId: 'tenant-1' },
];

export const mockVouchers = [
  { id: 'vou-1', number: 'V2024001', date: '2024-01-10', type: 'general', summary: '采购原材料', status: 'approved', creatorId: 'user-1', approverId: 'user-2', tenantId: 'tenant-1', creator: { realName: '张总经理' }, approver: { realName: '李财务总监' }, entries: [] },
  { id: 'vou-2', number: 'V2024002', date: '2024-01-12', type: 'general', summary: '销售回款', status: 'approved', creatorId: 'user-1', approverId: 'user-2', tenantId: 'tenant-1', creator: { realName: '张总经理' }, approver: { realName: '李财务总监' }, entries: [] },
  { id: 'vou-3', number: 'V2024003', date: '2024-01-15', type: 'general', summary: '支付房租', status: 'draft', creatorId: 'user-1', approverId: null, tenantId: 'tenant-1', creator: { realName: '张总经理' }, approver: null, entries: [] },
];

export const mockPurchaseOrders = [
  { id: 'po-1', number: 'PO2024001', date: '2024-01-10', supplierId: 'sup-1', supplierName: '深圳供应商有限公司', warehouseId: 'wh-1', warehouseName: '主仓库', status: 'approved', creatorId: 'user-3', approverId: 'user-1', tenantId: 'tenant-1', creator: { realName: '王采购经理' }, approver: { realName: '张总经理' }, items: [] },
  { id: 'po-2', number: 'PO2024002', date: '2024-01-12', supplierId: 'sup-2', supplierName: '杭州材料有限公司', warehouseId: 'wh-1', warehouseName: '主仓库', status: 'received', creatorId: 'user-3', approverId: 'user-1', tenantId: 'tenant-1', creator: { realName: '王采购经理' }, approver: { realName: '张总经理' }, items: [] },
  { id: 'po-3', number: 'PO2024003', date: '2024-01-15', supplierId: 'sup-3', supplierName: '南京零部件公司', warehouseId: 'wh-2', warehouseName: '备用仓库', status: 'draft', creatorId: 'user-9', approverId: null, tenantId: 'tenant-1', creator: { realName: '陈采购专员' }, approver: null, items: [] },
];

export const mockSaleOrders = [
  { id: 'so-1', number: 'SO2024001', date: '2024-01-10', customerId: 'cust-1', customerName: '上海贸易有限公司', warehouseId: 'wh-1', warehouseName: '主仓库', status: 'approved', creatorId: 'user-4', approverId: 'user-1', tenantId: 'tenant-1', creator: { realName: '赵销售总监' }, approver: { realName: '张总经理' }, items: [] },
  { id: 'so-2', number: 'SO2024002', date: '2024-01-12', customerId: 'cust-2', customerName: '广州科技有限公司', warehouseId: 'wh-1', warehouseName: '主仓库', status: 'shipped', creatorId: 'user-4', approverId: 'user-1', tenantId: 'tenant-1', creator: { realName: '赵销售总监' }, approver: { realName: '张总经理' }, items: [] },
  { id: 'so-3', number: 'SO2024003', date: '2024-01-15', customerId: 'cust-3', customerName: '北京实业集团', warehouseId: 'wh-2', warehouseName: '备用仓库', status: 'draft', creatorId: 'user-10', approverId: null, tenantId: 'tenant-1', creator: { realName: '刘销售专员' }, approver: null, items: [] },
];

export const mockInventories = [
  { id: 'inv-1', materialId: 'mat-1', materialCode: 'M001', materialName: '电子元器件A', warehouseId: 'wh-1', warehouseName: '主仓库', quantity: 1000, unit: '个', tenantId: 'tenant-1' },
  { id: 'inv-2', materialId: 'mat-2', materialCode: 'M002', materialName: '金属原材料', warehouseId: 'wh-1', warehouseName: '主仓库', quantity: 500, unit: 'kg', tenantId: 'tenant-1' },
  { id: 'inv-3', materialId: 'mat-3', materialCode: 'M003', materialName: '包装材料', warehouseId: 'wh-2', warehouseName: '备用仓库', quantity: 2000, unit: '件', tenantId: 'tenant-1' },
  { id: 'inv-4', materialId: 'mat-4', materialCode: 'M004', materialName: '塑料件', warehouseId: 'wh-2', warehouseName: '备用仓库', quantity: 800, unit: '个', tenantId: 'tenant-1' },
];

export const mockTransfers = [
  { id: 'tf-1', date: '2024-01-10', fromWarehouseId: 'wh-1', fromWarehouseName: '主仓库', toWarehouseId: 'wh-2', toWarehouseName: '备用仓库', status: 'approved', creatorId: 'user-5', approverId: 'user-1', tenantId: 'tenant-1', creator: { realName: '孙仓储主管' }, approver: { realName: '张总经理' }, items: [] },
  { id: 'tf-2', date: '2024-01-15', fromWarehouseId: 'wh-2', fromWarehouseName: '备用仓库', toWarehouseId: 'wh-1', toWarehouseName: '主仓库', status: 'draft', creatorId: 'user-5', approverId: null, tenantId: 'tenant-1', creator: { realName: '孙仓储主管' }, approver: null, items: [] },
];

export const mockReceivables = [
  { id: 'rec-1', customerId: 'cust-1', customerName: '上海贸易有限公司', amount: 100000, received: 60000, balance: 40000, status: 'partial', tenantId: 'tenant-1' },
  { id: 'rec-2', customerId: 'cust-2', customerName: '广州科技有限公司', amount: 80000, received: 80000, balance: 0, status: 'paid', tenantId: 'tenant-1' },
  { id: 'rec-3', customerId: 'cust-3', customerName: '北京实业集团', amount: 150000, received: 0, balance: 150000, status: 'unpaid', tenantId: 'tenant-1' },
];

export const mockReceivableSummary = {
  total: 330000,
  received: 140000,
  unpaid: 190000,
};

export const mockPayables = [
  { id: 'pay-1', supplierId: 'sup-1', supplierName: '深圳供应商有限公司', amount: 60000, paid: 40000, balance: 20000, status: 'partial', tenantId: 'tenant-1' },
  { id: 'pay-2', supplierId: 'sup-2', supplierName: '杭州材料有限公司', amount: 50000, paid: 50000, balance: 0, status: 'paid', tenantId: 'tenant-1' },
  { id: 'pay-3', supplierId: 'sup-3', supplierName: '南京零部件公司', amount: 80000, paid: 0, balance: 80000, status: 'unpaid', tenantId: 'tenant-1' },
];

export const mockPayableSummary = {
  total: 190000,
  paid: 90000,
  unpaid: 100000,
};

export const mockBalanceSheet = {
  assets: [
    { name: '流动资产', value: 2850000 },
    { name: '非流动资产', value: 1500000 },
  ],
  liabilities: [
    { name: '流动负债', value: 1300000 },
    { name: '非流动负债', value: 500000 },
  ],
  equity: [
    { name: '实收资本', value: 2000000 },
    { name: '留存收益', value: 550000 },
  ],
};

export const mockIncomeStatement = {
  revenue: [
    { name: '主营业务收入', value: 2500000 },
    { name: '其他业务收入', value: 300000 },
  ],
  cost: [
    { name: '主营业务成本', value: 1200000 },
    { name: '销售费用', value: 400000 },
    { name: '管理费用', value: 300000 },
  ],
  profit: {
    gross: 1600000,
    operating: 900000,
    net: 700000,
  },
};

export const mockInventoryReport = {
  materials: [
    { code: 'M001', name: '电子元器件A', category: '电子产品', quantity: 1000, avgPrice: 10.50, totalValue: 10500 },
    { code: 'M002', name: '金属原材料', category: '金属材料', quantity: 500, avgPrice: 25.80, totalValue: 12900 },
    { code: 'M003', name: '包装材料', category: '包装', quantity: 2000, avgPrice: 5.20, totalValue: 10400 },
    { code: 'M004', name: '塑料件', category: '塑料制品', quantity: 800, avgPrice: 8.00, totalValue: 6400 },
  ],
  summary: {
    totalQuantity: 4300,
    totalValue: 40200,
  },
};

export const mockPurchaseReport = {
  orders: [
    { number: 'PO2024001', date: '2024-01-10', supplier: '深圳供应商有限公司', amount: 50000, status: 'approved' },
    { number: 'PO2024002', date: '2024-01-12', supplier: '杭州材料有限公司', amount: 30000, status: 'received' },
    { number: 'PO2024003', date: '2024-01-15', supplier: '南京零部件公司', amount: 80000, status: 'draft' },
  ],
  summary: {
    totalOrders: 3,
    totalAmount: 160000,
    approvedAmount: 50000,
    receivedAmount: 30000,
  },
};

export const mockSaleReport = {
  orders: [
    { number: 'SO2024001', date: '2024-01-10', customer: '上海贸易有限公司', amount: 100000, status: 'approved' },
    { number: 'SO2024002', date: '2024-01-12', customer: '广州科技有限公司', amount: 80000, status: 'shipped' },
    { number: 'SO2024003', date: '2024-01-15', customer: '北京实业集团', amount: 150000, status: 'draft' },
  ],
  summary: {
    totalOrders: 3,
    totalAmount: 330000,
    approvedAmount: 100000,
    shippedAmount: 80000,
  },
};

export const mockDashboard = {
  totalOrders: 120,
  totalRevenue: 2500000,
  totalInventory: 4300,
  pendingApprovals: 8,
  recentOrders: [],
  inventoryAlerts: [],
};