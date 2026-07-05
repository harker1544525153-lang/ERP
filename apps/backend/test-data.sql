-- ERP系统测试数据脚本
-- 适用数据库: SQLite / PostgreSQL / MySQL
-- 包含完整业务数据：用户、角色、组织、科目、客户、供应商、物料、仓库、采购、销售、库存、应收、应付、凭证

-- ==================== 表结构定义 ====================

-- 租户表
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  realName VARCHAR(50) NOT NULL,
  orgId VARCHAR(36),
  roleId VARCHAR(36),
  email VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orgId) REFERENCES organizations(id),
  FOREIGN KEY (roleId) REFERENCES roles(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  permissions TEXT,
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 组织表
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) DEFAULT 'department',
  parentId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES organizations(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 会计科目表
CREATE TABLE IF NOT EXISTS accounts (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL,
  type VARCHAR(20),
  level INT DEFAULT 1,
  parentId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES accounts(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  shortName VARCHAR(50),
  contact VARCHAR(50),
  phone VARCHAR(20),
  address VARCHAR(255),
  taxCode VARCHAR(50),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  shortName VARCHAR(50),
  contact VARCHAR(50),
  phone VARCHAR(20),
  address VARCHAR(255),
  taxCode VARCHAR(50),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 物料表
CREATE TABLE IF NOT EXISTS materials (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  spec VARCHAR(100),
  unit VARCHAR(20) DEFAULT '个',
  category VARCHAR(50),
  price DECIMAL(12,2) DEFAULT 0,
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 仓库表
CREATE TABLE IF NOT EXISTS warehouses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 凭证表
CREATE TABLE IF NOT EXISTS vouchers (
  id VARCHAR(36) PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL,
  type VARCHAR(20) DEFAULT 'general',
  summary VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft',
  creatorId VARCHAR(36),
  approverId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creatorId) REFERENCES users(id),
  FOREIGN KEY (approverId) REFERENCES users(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 凭证分录表
CREATE TABLE IF NOT EXISTS voucher_entries (
  id VARCHAR(36) PRIMARY KEY,
  voucherId VARCHAR(36) NOT NULL,
  accountId VARCHAR(36) NOT NULL,
  debit DECIMAL(12,2) DEFAULT 0,
  credit DECIMAL(12,2) DEFAULT 0,
  summary VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (voucherId) REFERENCES vouchers(id),
  FOREIGN KEY (accountId) REFERENCES accounts(id)
);

-- 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(36) PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL,
  supplierId VARCHAR(36) NOT NULL,
  warehouseId VARCHAR(36),
  totalAmount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  creatorId VARCHAR(36),
  approverId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id),
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (creatorId) REFERENCES users(id),
  FOREIGN KEY (approverId) REFERENCES users(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 采购订单项表
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id VARCHAR(36) PRIMARY KEY,
  purchaseOrderId VARCHAR(36) NOT NULL,
  materialId VARCHAR(36) NOT NULL,
  quantity INT DEFAULT 0,
  unitPrice DECIMAL(12,2) DEFAULT 0,
  receivedQty INT DEFAULT 0,
  FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id),
  FOREIGN KEY (materialId) REFERENCES materials(id)
);

-- 销售订单表
CREATE TABLE IF NOT EXISTS sale_orders (
  id VARCHAR(36) PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL,
  customerId VARCHAR(36) NOT NULL,
  warehouseId VARCHAR(36),
  totalAmount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  creatorId VARCHAR(36),
  approverId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (creatorId) REFERENCES users(id),
  FOREIGN KEY (approverId) REFERENCES users(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 销售订单项表
CREATE TABLE IF NOT EXISTS sale_order_items (
  id VARCHAR(36) PRIMARY KEY,
  saleOrderId VARCHAR(36) NOT NULL,
  materialId VARCHAR(36) NOT NULL,
  quantity INT DEFAULT 0,
  unitPrice DECIMAL(12,2) DEFAULT 0,
  shippedQty INT DEFAULT 0,
  FOREIGN KEY (saleOrderId) REFERENCES sale_orders(id),
  FOREIGN KEY (materialId) REFERENCES materials(id)
);

-- 库存表
CREATE TABLE IF NOT EXISTS inventories (
  id VARCHAR(36) PRIMARY KEY,
  warehouseId VARCHAR(36) NOT NULL,
  materialId VARCHAR(36) NOT NULL,
  quantity INT DEFAULT 0,
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (warehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (materialId) REFERENCES materials(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id),
  UNIQUE (warehouseId, materialId)
);

-- 库存调拨表
CREATE TABLE IF NOT EXISTS transfers (
  id VARCHAR(36) PRIMARY KEY,
  number VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL,
  fromWarehouseId VARCHAR(36) NOT NULL,
  toWarehouseId VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  creatorId VARCHAR(36),
  approverId VARCHAR(36),
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fromWarehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (toWarehouseId) REFERENCES warehouses(id),
  FOREIGN KEY (creatorId) REFERENCES users(id),
  FOREIGN KEY (approverId) REFERENCES users(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 应收款表
CREATE TABLE IF NOT EXISTS receivables (
  id VARCHAR(36) PRIMARY KEY,
  customerId VARCHAR(36) NOT NULL,
  saleOrderId VARCHAR(36),
  date DATE NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  receivedAmount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  FOREIGN KEY (saleOrderId) REFERENCES sale_orders(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- 应付款表
CREATE TABLE IF NOT EXISTS payables (
  id VARCHAR(36) PRIMARY KEY,
  supplierId VARCHAR(36) NOT NULL,
  purchaseOrderId VARCHAR(36),
  date DATE NOT NULL,
  amount DECIMAL(12,2) DEFAULT 0,
  paidAmount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  tenantId VARCHAR(36) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplierId) REFERENCES suppliers(id),
  FOREIGN KEY (purchaseOrderId) REFERENCES purchase_orders(id),
  FOREIGN KEY (tenantId) REFERENCES tenants(id)
);

-- ==================== 测试数据插入 ====================

-- 租户数据
INSERT INTO tenants (id, name, code) VALUES 
('tenant-1', '测试企业', 'TEST001');

-- 角色数据
INSERT INTO roles (id, name, code, permissions, tenantId) VALUES 
('role-1', '超级管理员', 'admin', '["*"]', 'tenant-1'),
('role-2', '财务主管', 'finance', '["account:view","account:edit","voucher:view","voucher:edit","report:view"]', 'tenant-1'),
('role-3', '采购专员', 'purchase', '["supplier:view","purchase:view","purchase:edit","material:view"]', 'tenant-1'),
('role-4', '销售专员', 'sale', '["customer:view","sale:view","sale:edit","material:view"]', 'tenant-1'),
('role-5', '仓库管理员', 'warehouse', '["warehouse:view","inventory:view","inventory:edit","material:view"]', 'tenant-1'),
('role-6', '运营总监', 'operations', '["purchase:view","sale:view","report:view","inventory:view"]', 'tenant-1');

-- 组织数据
INSERT INTO organizations (id, name, code, type, parentId, tenantId) VALUES 
('org-1', '总公司', 'COMPANY', 'company', NULL, 'tenant-1'),
('org-2', '财务部', 'FINANCE', 'department', 'org-1', 'tenant-1'),
('org-3', '采购部', 'PURCHASE', 'department', 'org-1', 'tenant-1'),
('org-4', '销售部', 'SALE', 'department', 'org-1', 'tenant-1'),
('org-5', '仓储部', 'WAREHOUSE', 'department', 'org-1', 'tenant-1'),
('org-6', '技术部', 'TECH', 'department', 'org-1', 'tenant-1'),
('org-7', '市场部', 'MARKET', 'department', 'org-1', 'tenant-1'),
('org-8', '行政部', 'ADMIN', 'department', 'org-1', 'tenant-1'),
('org-9', '采购一组', 'PURCHASE-01', 'team', 'org-3', 'tenant-1'),
('org-10', '销售一组', 'SALE-01', 'team', 'org-4', 'tenant-1');

-- 用户数据 (密码: admin123, bcrypt哈希)
INSERT INTO users (id, username, password, realName, orgId, roleId, email, phone, status, tenantId) VALUES 
('user-1', 'admin', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '管理员', 'org-1', 'role-1', 'admin@erp.com', '13800138000', 'active', 'tenant-1'),
('user-2', 'finance', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '张财务', 'org-2', 'role-2', 'finance@erp.com', '13800138001', 'active', 'tenant-1'),
('user-3', 'purchase', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '李采购', 'org-9', 'role-3', 'purchase@erp.com', '13800138002', 'active', 'tenant-1'),
('user-4', 'sale', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '王销售', 'org-10', 'role-4', 'sale@erp.com', '13800138003', 'active', 'tenant-1'),
('user-5', 'warehouse', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '赵仓管', 'org-5', 'role-5', 'warehouse@erp.com', '13800138004', 'active', 'tenant-1'),
('user-6', 'operations', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '刘总监', 'org-1', 'role-6', 'operations@erp.com', '13800138005', 'active', 'tenant-1'),
('user-7', 'purchase2', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '周采购', 'org-9', 'role-3', 'purchase2@erp.com', '13800138006', 'active', 'tenant-1'),
('user-8', 'sale2', '$2a$10$M0dOzIzrQB3Fj0Rw9Xa0zOpUyop3Y5mvg.Exdgakm/VhBs5LBelK6', '吴销售', 'org-10', 'role-4', 'sale2@erp.com', '13800138007', 'active', 'tenant-1');

-- 会计科目数据
INSERT INTO accounts (id, code, name, category, type, level, parentId, tenantId) VALUES 
('acc-1', '1001', '库存现金', 'asset', 'cash', 1, NULL, 'tenant-1'),
('acc-2', '1002', '银行存款', 'asset', 'bank', 1, NULL, 'tenant-1'),
('acc-3', '100201', '工商银行', 'asset', 'bank', 2, 'acc-2', 'tenant-1'),
('acc-4', '100202', '建设银行', 'asset', 'bank', 2, 'acc-2', 'tenant-1'),
('acc-5', '100203', '招商银行', 'asset', 'bank', 2, 'acc-2', 'tenant-1'),
('acc-6', '1122', '应收账款', 'asset', 'receivable', 1, NULL, 'tenant-1'),
('acc-7', '1123', '预付账款', 'asset', 'receivable', 1, NULL, 'tenant-1'),
('acc-8', '1403', '原材料', 'asset', 'inventory', 1, NULL, 'tenant-1'),
('acc-9', '1405', '库存商品', 'asset', 'inventory', 1, NULL, 'tenant-1'),
('acc-10', '1511', '长期股权投资', 'asset', 'investment', 1, NULL, 'tenant-1'),
('acc-11', '1601', '固定资产', 'asset', 'fixed', 1, NULL, 'tenant-1'),
('acc-12', '1602', '累计折旧', 'asset', 'fixed', 1, NULL, 'tenant-1'),
('acc-13', '1701', '无形资产', 'asset', 'intangible', 1, NULL, 'tenant-1'),
('acc-14', '2001', '短期借款', 'liability', 'loan', 1, NULL, 'tenant-1'),
('acc-15', '2202', '应付账款', 'liability', 'payable', 1, NULL, 'tenant-1'),
('acc-16', '2203', '预收账款', 'liability', 'payable', 1, NULL, 'tenant-1'),
('acc-17', '2211', '应付职工薪酬', 'liability', 'payable', 1, NULL, 'tenant-1'),
('acc-18', '2221', '应交税费', 'liability', 'payable', 1, NULL, 'tenant-1'),
('acc-19', '2501', '长期借款', 'liability', 'loan', 1, NULL, 'tenant-1'),
('acc-20', '4001', '实收资本', 'equity', 'capital', 1, NULL, 'tenant-1'),
('acc-21', '4002', '资本公积', 'equity', 'capital', 1, NULL, 'tenant-1'),
('acc-22', '4103', '本年利润', 'equity', 'profit', 1, NULL, 'tenant-1'),
('acc-23', '4104', '利润分配', 'equity', 'profit', 1, NULL, 'tenant-1'),
('acc-24', '6001', '主营业务收入', 'income', 'revenue', 1, NULL, 'tenant-1'),
('acc-25', '6051', '其他业务收入', 'income', 'revenue', 1, NULL, 'tenant-1'),
('acc-26', '6301', '营业外收入', 'income', 'revenue', 1, NULL, 'tenant-1'),
('acc-27', '6401', '主营业务成本', 'expense', 'cost', 1, NULL, 'tenant-1'),
('acc-28', '6402', '其他业务成本', 'expense', 'cost', 1, NULL, 'tenant-1'),
('acc-29', '6601', '销售费用', 'expense', 'sale', 1, NULL, 'tenant-1'),
('acc-30', '6602', '管理费用', 'expense', 'admin', 1, NULL, 'tenant-1'),
('acc-31', '6603', '财务费用', 'expense', 'finance', 1, NULL, 'tenant-1'),
('acc-32', '6711', '营业外支出', 'expense', 'other', 1, NULL, 'tenant-1'),
('acc-33', '6801', '所得税费用', 'expense', 'tax', 1, NULL, 'tenant-1');

-- 客户数据
INSERT INTO customers (id, code, name, shortName, contact, phone, address, taxCode, tenantId) VALUES 
('cust-1', 'C001', '上海贸易有限公司', '上海贸易', '王经理', '021-12345678', '上海市浦东新区陆家嘴金融中心88号', '91310000MA12345678', 'tenant-1'),
('cust-2', 'C002', '广州科技有限公司', '广州科技', '李总监', '020-87654321', '广州市天河区珠江新城花城大道100号', '91440000MA87654321', 'tenant-1'),
('cust-3', 'C003', '北京实业集团', '北京实业', '张总', '010-11112222', '北京市朝阳区CBD建国路88号', '91110000MA11112222', 'tenant-1'),
('cust-4', 'C004', '深圳电子科技有限公司', '深圳电子', '赵经理', '0755-33334444', '深圳市南山区科技园南区深南大道999号', '91440300MA33334444', 'tenant-1'),
('cust-5', 'C005', '杭州网络科技有限公司', '杭州网络', '周总监', '0571-55556666', '杭州市西湖区文三路478号华星创业大厦', '91330000MA55556666', 'tenant-1'),
('cust-6', 'C006', '成都软件有限公司', '成都软件', '吴经理', '028-77778888', '成都市高新区天府软件园A区', '91510000MA77778888', 'tenant-1'),
('cust-7', 'C007', '武汉制造有限公司', '武汉制造', '郑总', '027-99990000', '武汉市东湖高新区光谷大道128号', '91420000MA99990000', 'tenant-1'),
('cust-8', 'C008', '南京工业有限公司', '南京工业', '孙经理', '025-22223333', '南京市江宁区经济技术开发区', '91320000MA22223333', 'tenant-1');

-- 供应商数据
INSERT INTO suppliers (id, code, name, shortName, contact, phone, address, taxCode, tenantId) VALUES 
('sup-1', 'S001', '深圳供应商有限公司', '深圳供应', '陈经理', '0755-12345678', '深圳市南山区蛇口工业区', '91440300MA12345678', 'tenant-1'),
('sup-2', 'S002', '杭州材料有限公司', '杭州材料', '吴经理', '0571-87654321', '杭州市萧山区经济技术开发区', '91330000MA87654321', 'tenant-1'),
('sup-3', 'S003', '南京零部件公司', '南京零件', '郑经理', '025-22223333', '南京市江宁区工业园区', '91320000MA22223333', 'tenant-1'),
('sup-4', 'S004', '苏州金属材料有限公司', '苏州金属', '孙经理', '0512-44445555', '苏州市工业园区金鸡湖大道', '91320000MA44445555', 'tenant-1'),
('sup-5', 'S005', '成都电子元件有限公司', '成都电子', '马经理', '028-66667777', '成都市高新区电子信息产业园', '91510000MA66667777', 'tenant-1'),
('sup-6', 'S006', '东莞塑胶有限公司', '东莞塑胶', '冯经理', '0769-88889999', '东莞市长安镇工业区', '91441900MA88889999', 'tenant-1'),
('sup-7', 'S007', '天津五金制品有限公司', '天津五金', '何经理', '022-55556666', '天津市滨海新区工业区', '91120000MA55556666', 'tenant-1'),
('sup-8', 'S008', '青岛化工有限公司', '青岛化工', '罗经理', '0532-77778888', '青岛市城阳区化工园区', '91370000MA77778888', 'tenant-1');

-- 物料数据
INSERT INTO materials (id, code, name, spec, unit, category, price, tenantId) VALUES 
('mat-1', 'M001', '电子元器件A', '型号X100', '个', '电子产品', 10.50, 'tenant-1'),
('mat-2', 'M002', '电子元器件B', '型号X200', '个', '电子产品', 15.80, 'tenant-1'),
('mat-3', 'M003', '金属原材料', '规格20mm', 'kg', '金属材料', 25.80, 'tenant-1'),
('mat-4', 'M004', '包装材料', '标准尺寸', '件', '包装', 5.20, 'tenant-1'),
('mat-5', 'M005', '塑料件', '型号P200', '个', '塑料制品', 8.00, 'tenant-1'),
('mat-6', 'M006', '橡胶密封圈', '直径30mm', '个', '橡胶制品', 2.50, 'tenant-1'),
('mat-7', 'M007', '螺丝螺母套装', 'M5-M10', '套', '五金配件', 12.00, 'tenant-1'),
('mat-8', 'M008', '电线电缆', 'RVV 3x1.5', '米', '电气材料', 8.50, 'tenant-1'),
('mat-9', 'M009', '电路板', '型号PCB-001', '块', '电子产品', 58.00, 'tenant-1'),
('mat-10', 'M010', '显示屏', '10.1寸', '个', '电子产品', 280.00, 'tenant-1'),
('mat-11', 'M011', '铝合金型材', '6063-T5', '米', '金属材料', 38.50, 'tenant-1'),
('mat-12', 'M012', '不锈钢板', '304 2mm', '张', '金属材料', 156.00, 'tenant-1'),
('mat-13', 'M013', '纸箱', '50x40x30cm', '个', '包装', 3.80, 'tenant-1'),
('mat-14', 'M014', '气泡膜', '宽1m', '米', '包装', 2.20, 'tenant-1'),
('mat-15', 'M015', '硅胶垫', '厚度3mm', '片', '橡胶制品', 1.80, 'tenant-1'),
('mat-16', 'M016', '散热片', '铝制', '个', '五金配件', 18.50, 'tenant-1');

-- 仓库数据
INSERT INTO warehouses (id, code, name, address, tenantId) VALUES 
('wh-1', 'WH001', '主仓库', '工业园区A栋1层', 'tenant-1'),
('wh-2', 'WH002', '备用仓库', '工业园区B栋2层', 'tenant-1'),
('wh-3', 'WH003', '原材料仓库', '工业园区C栋1层', 'tenant-1'),
('wh-4', 'WH004', '成品仓库', '工业园区D栋1层', 'tenant-1'),
('wh-5', 'WH005', '电子仓库', '工业园区E栋1层', 'tenant-1'),
('wh-6', 'WH006', '包装材料库', '工业园区F栋1层', 'tenant-1');

-- 凭证数据
INSERT INTO vouchers (id, number, date, type, summary, status, creatorId, approverId, tenantId) VALUES 
('vou-1', 'V2024001', '2024-01-10', 'general', '采购原材料入库', 'approved', 'user-1', 'user-2', 'tenant-1'),
('vou-2', 'V2024002', '2024-01-12', 'general', '销售回款', 'approved', 'user-1', 'user-2', 'tenant-1'),
('vou-3', 'V2024003', '2024-01-15', 'general', '支付办公房租', 'approved', 'user-1', 'user-2', 'tenant-1'),
('vou-4', 'V2024004', '2024-01-18', 'general', '购买办公用品', 'draft', 'user-1', NULL, 'tenant-1'),
('vou-5', 'V2024005', '2024-01-20', 'general', '计提工资', 'draft', 'user-2', NULL, 'tenant-1'),
('vou-6', 'V2024006', '2024-01-22', 'general', '销售商品出库', 'approved', 'user-1', 'user-2', 'tenant-1'),
('vou-7', 'V2024007', '2024-01-25', 'general', '固定资产购入', 'approved', 'user-1', 'user-2', 'tenant-1'),
('vou-8', 'V2024008', '2024-01-28', 'general', '银行贷款到账', 'approved', 'user-2', 'user-1', 'tenant-1'),
('vou-9', 'V2024009', '2024-02-01', 'general', '支付水电费', 'draft', 'user-2', NULL, 'tenant-1'),
('vou-10', 'V2024010', '2024-02-05', 'general', '计提折旧', 'draft', 'user-2', NULL, 'tenant-1');

-- 凭证分录数据
INSERT INTO voucher_entries (id, voucherId, accountId, debit, credit, summary) VALUES 
('ve-1', 'vou-1', 'acc-8', 50000.00, 0.00, '原材料入库'),
('ve-2', 'vou-1', 'acc-15', 0.00, 50000.00, '应付供应商'),
('ve-3', 'vou-2', 'acc-3', 30000.00, 0.00, '银行收款'),
('ve-4', 'vou-2', 'acc-6', 0.00, 30000.00, '应收账款收回'),
('ve-5', 'vou-3', 'acc-30', 15000.00, 0.00, '房租支出'),
('ve-6', 'vou-3', 'acc-3', 0.00, 15000.00, '银行付款'),
('ve-7', 'vou-4', 'acc-30', 2000.00, 0.00, '办公支出'),
('ve-8', 'vou-4', 'acc-1', 0.00, 2000.00, '现金付款'),
('ve-9', 'vou-5', 'acc-30', 80000.00, 0.00, '工资支出'),
('ve-10', 'vou-5', 'acc-17', 0.00, 80000.00, '应付工资'),
('ve-11', 'vou-6', 'acc-27', 45000.00, 0.00, '销售成本'),
('ve-12', 'vou-6', 'acc-9', 0.00, 45000.00, '库存商品减少'),
('ve-13', 'vou-6', 'acc-6', 68000.00, 0.00, '应收账款'),
('ve-14', 'vou-6', 'acc-24', 0.00, 68000.00, '主营业务收入'),
('ve-15', 'vou-7', 'acc-11', 120000.00, 0.00, '固定资产增加'),
('ve-16', 'vou-7', 'acc-3', 0.00, 120000.00, '银行付款'),
('ve-17', 'vou-8', 'acc-4', 500000.00, 0.00, '银行贷款'),
('ve-18', 'vou-8', 'acc-14', 0.00, 500000.00, '短期借款'),
('ve-19', 'vou-9', 'acc-30', 5600.00, 0.00, '水电费用'),
('ve-20', 'vou-9', 'acc-3', 0.00, 5600.00, '银行付款'),
('ve-21', 'vou-10', 'acc-30', 12000.00, 0.00, '折旧费用'),
('ve-22', 'vou-10', 'acc-12', 0.00, 12000.00, '累计折旧');

-- 采购订单数据
INSERT INTO purchase_orders (id, number, date, supplierId, warehouseId, totalAmount, status, creatorId, approverId, tenantId) VALUES 
('po-1', 'PO2024001', '2024-01-08', 'sup-1', 'wh-3', 26000.00, 'completed', 'user-3', 'user-1', 'tenant-1'),
('po-2', 'PO2024002', '2024-01-12', 'sup-2', 'wh-3', 25800.00, 'approved', 'user-3', 'user-1', 'tenant-1'),
('po-3', 'PO2024003', '2024-01-18', 'sup-3', 'wh-2', 10400.00, 'approved', 'user-3', 'user-1', 'tenant-1'),
('po-4', 'PO2024004', '2024-01-22', 'sup-4', 'wh-3', 15000.00, 'draft', 'user-3', NULL, 'tenant-1'),
('po-5', 'PO2024005', '2024-01-25', 'sup-5', 'wh-1', 8500.00, 'draft', 'user-7', NULL, 'tenant-1'),
('po-6', 'PO2024006', '2024-01-28', 'sup-6', 'wh-6', 3800.00, 'approved', 'user-7', 'user-1', 'tenant-1'),
('po-7', 'PO2024007', '2024-02-02', 'sup-7', 'wh-3', 24000.00, 'approved', 'user-3', 'user-1', 'tenant-1'),
('po-8', 'PO2024008', '2024-02-05', 'sup-8', 'wh-3', 31200.00, 'draft', 'user-7', NULL, 'tenant-1'),
('po-9', 'PO2024009', '2024-02-10', 'sup-1', 'wh-5', 58000.00, 'pending', 'user-3', NULL, 'tenant-1'),
('po-10', 'PO2024010', '2024-02-15', 'sup-2', 'wh-3', 47700.00, 'pending', 'user-7', NULL, 'tenant-1');

-- 采购订单项数据
INSERT INTO purchase_order_items (id, purchaseOrderId, materialId, quantity, unitPrice, receivedQty) VALUES 
('poi-1', 'po-1', 'mat-1', 1000, 10.50, 1000),
('poi-2', 'po-1', 'mat-2', 1000, 15.50, 1000),
('poi-3', 'po-2', 'mat-3', 1000, 25.80, 600),
('poi-4', 'po-3', 'mat-4', 2000, 5.20, 0),
('poi-5', 'po-4', 'mat-5', 1500, 10.00, 0),
('poi-6', 'po-4', 'mat-7', 500, 12.00, 0),
('poi-7', 'po-5', 'mat-8', 1000, 8.50, 0),
('poi-8', 'po-6', 'mat-13', 1000, 3.80, 500),
('poi-9', 'po-7', 'mat-11', 600, 38.50, 300),
('poi-10', 'po-8', 'mat-12', 200, 156.00, 0),
('poi-11', 'po-9', 'mat-9', 1000, 58.00, 0),
('poi-12', 'po-10', 'mat-3', 1500, 25.80, 0),
('poi-13', 'po-10', 'mat-16', 300, 18.50, 0);

-- 销售订单数据
INSERT INTO sale_orders (id, number, date, customerId, warehouseId, totalAmount, status, creatorId, approverId, tenantId) VALUES 
('so-1', 'SO2024001', '2024-01-05', 'cust-1', 'wh-4', 30000.00, 'completed', 'user-4', 'user-1', 'tenant-1'),
('so-2', 'SO2024002', '2024-01-10', 'cust-2', 'wh-4', 25800.00, 'approved', 'user-4', 'user-1', 'tenant-1'),
('so-3', 'SO2024003', '2024-01-15', 'cust-3', 'wh-4', 16000.00, 'approved', 'user-4', 'user-1', 'tenant-1'),
('so-4', 'SO2024004', '2024-01-20', 'cust-4', 'wh-4', 40000.00, 'draft', 'user-4', NULL, 'tenant-1'),
('so-5', 'SO2024005', '2024-01-25', 'cust-5', 'wh-1', 25000.00, 'draft', 'user-8', NULL, 'tenant-1'),
('so-6', 'SO2024006', '2024-01-28', 'cust-6', 'wh-5', 28000.00, 'approved', 'user-8', 'user-1', 'tenant-1'),
('so-7', 'SO2024007', '2024-02-02', 'cust-7', 'wh-4', 42000.00, 'approved', 'user-4', 'user-1', 'tenant-1'),
('so-8', 'SO2024008', '2024-02-05', 'cust-8', 'wh-4', 56000.00, 'draft', 'user-8', NULL, 'tenant-1'),
('so-9', 'SO2024009', '2024-02-10', 'cust-1', 'wh-5', 35000.00, 'pending', 'user-4', NULL, 'tenant-1'),
('so-10', 'SO2024010', '2024-02-15', 'cust-2', 'wh-4', 62000.00, 'pending', 'user-8', NULL, 'tenant-1');

-- 销售订单项数据
INSERT INTO sale_order_items (id, saleOrderId, materialId, quantity, unitPrice, shippedQty) VALUES 
('soi-1', 'so-1', 'mat-1', 1000, 15.00, 1000),
('soi-2', 'so-1', 'mat-2', 1000, 15.00, 1000),
('soi-3', 'so-2', 'mat-3', 800, 32.25, 500),
('soi-4', 'so-3', 'mat-5', 2000, 8.00, 1000),
('soi-5', 'so-4', 'mat-1', 2000, 14.00, 0),
('soi-6', 'so-4', 'mat-2', 800, 15.00, 0),
('soi-7', 'so-5', 'mat-3', 500, 35.00, 0),
('soi-8', 'so-5', 'mat-7', 500, 15.00, 0),
('soi-9', 'so-6', 'mat-9', 500, 56.00, 300),
('soi-10', 'so-7', 'mat-10', 150, 280.00, 100),
('soi-11', 'so-8', 'mat-11', 1000, 42.00, 0),
('soi-12', 'so-9', 'mat-1', 1500, 14.00, 0),
('soi-13', 'so-9', 'mat-9', 300, 56.00, 0),
('soi-14', 'so-10', 'mat-10', 200, 280.00, 0),
('soi-15', 'so-10', 'mat-12', 60, 156.00, 0);

-- 库存数据
INSERT INTO inventories (id, warehouseId, materialId, quantity, tenantId) VALUES 
('inv-1', 'wh-1', 'mat-1', 800, 'tenant-1'),
('inv-2', 'wh-1', 'mat-2', 500, 'tenant-1'),
('inv-3', 'wh-1', 'mat-5', 300, 'tenant-1'),
('inv-4', 'wh-2', 'mat-3', 600, 'tenant-1'),
('inv-5', 'wh-2', 'mat-4', 2000, 'tenant-1'),
('inv-6', 'wh-2', 'mat-6', 1500, 'tenant-1'),
('inv-7', 'wh-3', 'mat-3', 1200, 'tenant-1'),
('inv-8', 'wh-3', 'mat-5', 800, 'tenant-1'),
('inv-9', 'wh-3', 'mat-7', 500, 'tenant-1'),
('inv-10', 'wh-3', 'mat-11', 400, 'tenant-1'),
('inv-11', 'wh-4', 'mat-7', 800, 'tenant-1'),
('inv-12', 'wh-4', 'mat-8', 1500, 'tenant-1'),
('inv-13', 'wh-4', 'mat-10', 200, 'tenant-1'),
('inv-14', 'wh-5', 'mat-1', 1200, 'tenant-1'),
('inv-15', 'wh-5', 'mat-2', 800, 'tenant-1'),
('inv-16', 'wh-5', 'mat-9', 500, 'tenant-1'),
('inv-17', 'wh-6', 'mat-4', 3000, 'tenant-1'),
('inv-18', 'wh-6', 'mat-13', 2000, 'tenant-1'),
('inv-19', 'wh-6', 'mat-14', 5000, 'tenant-1'),
('inv-20', 'wh-3', 'mat-12', 100, 'tenant-1');

-- 库存调拨数据
INSERT INTO transfers (id, number, date, fromWarehouseId, toWarehouseId, status, creatorId, approverId, tenantId) VALUES 
('tf-1', 'TF2024001', '2024-01-05', 'wh-1', 'wh-2', 'approved', 'user-5', 'user-1', 'tenant-1'),
('tf-2', 'TF2024002', '2024-01-12', 'wh-3', 'wh-4', 'approved', 'user-5', 'user-1', 'tenant-1'),
('tf-3', 'TF2024003', '2024-01-20', 'wh-2', 'wh-1', 'draft', 'user-5', NULL, 'tenant-1'),
('tf-4', 'TF2024004', '2024-02-02', 'wh-5', 'wh-4', 'approved', 'user-5', 'user-1', 'tenant-1'),
('tf-5', 'TF2024005', '2024-02-10', 'wh-3', 'wh-5', 'pending', 'user-5', NULL, 'tenant-1'),
('tf-6', 'TF2024006', '2024-02-15', 'wh-6', 'wh-1', 'draft', 'user-5', NULL, 'tenant-1');

-- 应收款数据
INSERT INTO receivables (id, customerId, saleOrderId, date, amount, receivedAmount, status, tenantId) VALUES 
('rec-1', 'cust-1', 'so-1', '2024-01-05', 30000.00, 20000.00, 'partial', 'tenant-1'),
('rec-2', 'cust-2', 'so-2', '2024-01-10', 25800.00, 0.00, 'pending', 'tenant-1'),
('rec-3', 'cust-3', 'so-3', '2024-01-15', 16000.00, 8000.00, 'partial', 'tenant-1'),
('rec-4', 'cust-4', 'so-4', '2024-01-20', 40000.00, 0.00, 'pending', 'tenant-1'),
('rec-5', 'cust-5', 'so-5', '2024-01-25', 25000.00, 0.00, 'pending', 'tenant-1'),
('rec-6', 'cust-6', 'so-6', '2024-01-28', 28000.00, 14000.00, 'partial', 'tenant-1'),
('rec-7', 'cust-7', 'so-7', '2024-02-02', 42000.00, 21000.00, 'partial', 'tenant-1'),
('rec-8', 'cust-8', 'so-8', '2024-02-05', 56000.00, 0.00, 'pending', 'tenant-1'),
('rec-9', 'cust-1', 'so-9', '2024-02-10', 35000.00, 0.00, 'pending', 'tenant-1'),
('rec-10', 'cust-2', 'so-10', '2024-02-15', 62000.00, 0.00, 'pending', 'tenant-1'),
('rec-11', 'cust-3', 'so-1', '2024-01-05', 30000.00, 30000.00, 'paid', 'tenant-1'),
('rec-12', 'cust-4', 'so-2', '2024-01-10', 25800.00, 25800.00, 'paid', 'tenant-1');

-- 应付款数据
INSERT INTO payables (id, supplierId, purchaseOrderId, date, amount, paidAmount, status, tenantId) VALUES 
('pay-1', 'sup-1', 'po-1', '2024-01-08', 26000.00, 26000.00, 'paid', 'tenant-1'),
('pay-2', 'sup-2', 'po-2', '2024-01-12', 25800.00, 10000.00, 'partial', 'tenant-1'),
('pay-3', 'sup-3', 'po-3', '2024-01-18', 10400.00, 0.00, 'pending', 'tenant-1'),
('pay-4', 'sup-4', 'po-4', '2024-01-22', 15000.00, 0.00, 'pending', 'tenant-1'),
('pay-5', 'sup-5', 'po-5', '2024-01-25', 8500.00, 0.00, 'pending', 'tenant-1'),
('pay-6', 'sup-6', 'po-6', '2024-01-28', 3800.00, 1900.00, 'partial', 'tenant-1'),
('pay-7', 'sup-7', 'po-7', '2024-02-02', 24000.00, 0.00, 'pending', 'tenant-1'),
('pay-8', 'sup-8', 'po-8', '2024-02-05', 31200.00, 0.00, 'pending', 'tenant-1'),
('pay-9', 'sup-1', 'po-9', '2024-02-10', 58000.00, 0.00, 'pending', 'tenant-1'),
('pay-10', 'sup-2', 'po-10', '2024-02-15', 47700.00, 0.00, 'pending', 'tenant-1'),
('pay-11', 'sup-3', 'po-1', '2024-01-08', 26000.00, 26000.00, 'paid', 'tenant-1'),
('pay-12', 'sup-4', 'po-2', '2024-01-12', 25800.00, 25800.00, 'paid', 'tenant-1');

-- ==================== 数据统计汇总 ====================
-- 用户: 8人
-- 角色: 6个
-- 组织: 10个
-- 会计科目: 33个
-- 客户: 8个
-- 供应商: 8个
-- 物料: 16种
-- 仓库: 6个
-- 凭证: 10张(含5张草稿, 5张已审核)
-- 采购订单: 10张(含3张草稿, 2张待审核, 3张已审核, 2张已完成)
-- 销售订单: 10张(含3张草稿, 2张待审核, 3张已审核, 2张已完成)
-- 库存: 20条记录
-- 调拨: 6张(含2张草稿, 1张待审核, 3张已审核)
-- 应收款: 12条(含2条已结清, 4条部分收款, 6条待收款)
-- 应付款: 12条(含3条已结清, 2条部分付款, 7条待付款)

-- ==================== 使用说明 ====================
-- 1. 创建数据库并执行此脚本
-- 2. 默认管理员账号: admin / admin123
-- 3. 其他用户账号: finance, purchase, sale, warehouse, operations, purchase2, sale2
--    密码均为: admin123
-- 4. 数据涵盖完整业务流程，可直接测试系统功能