const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'erp-secret-key';

const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const INIT_FILE = path.join(__dirname, 'data-init.json');

let data = null;

const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } else {
    data = JSON.parse(fs.readFileSync(INIT_FILE, 'utf8'));
    saveData();
  }
};

loadData();

const saveData = () => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('[Auth] Request URL:', req.originalUrl, 'Method:', req.method);
  console.log('[Auth] Authorization header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('[Auth] No token provided, returning 401');
    return res.sendStatus(401);
  }
  console.log('[Auth] Token found, length:', token.length);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[Auth] Token verification failed:', err.message, 'Error name:', err.name);
      return res.sendStatus(403);
    }
    console.log('[Auth] Token verified successfully:', user);
    req.user = user;
    next();
  });
};

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = data.users.find(u => u.username === username);
  
  if (!user) return res.status(401).json({ message: '账号或密码错误' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: '账号或密码错误' });
  
  const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, JWT_SECRET);
  res.json({ message: '登录成功', data: { access_token: token, user } });
});

app.get('/api/admin/verify', authenticateToken, (req, res) => {
  const user = data.users.find(u => u.id === req.user.userId);
  if (user) {
    res.json({ data: { user } });
  } else {
    res.sendStatus(404);
  }
});

app.get('/api/organizations', authenticateToken, (req, res) => {
  const orgs = data.organizations.filter(o => o.tenantId === req.user.tenantId).map(o => ({
    ...o,
    parent: o.parentId ? data.organizations.find(p => p.id === o.parentId) : null
  }));
  res.json({ data: orgs });
});

app.get('/api/organizations/tree', authenticateToken, (req, res) => {
  const orgs = data.organizations.filter(o => o.tenantId === req.user.tenantId);
  const buildTree = (parentId) => {
    return orgs.filter(o => o.parentId == parentId).map(o => ({
      ...o,
      children: buildTree(o.id),
      parent: null
    }));
  };
  const tree = buildTree(null);
  res.json({ data: tree });
});

app.post('/api/organizations', authenticateToken, (req, res) => {
  const org = { id: `org-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.organizations.push(org);
  saveData();
  res.json({ message: '新增组织成功', data: org });
});

app.put('/api/organizations/:id', authenticateToken, (req, res) => {
  const index = data.organizations.findIndex(o => o.id === req.params.id);
  if (index !== -1) {
    data.organizations[index] = { ...data.organizations[index], ...req.body };
    saveData();
    res.json({ message: '更新组织成功', data: data.organizations[index] });
  } else {
    res.status(404).json({ message: '组织不存在' });
  }
});

app.delete('/api/organizations/:id', authenticateToken, (req, res) => {
  const org = data.organizations.find(o => o.id === req.params.id);
  if (!org) {
    return res.status(404).json({ message: '组织不存在' });
  }
  data.organizations = data.organizations.filter(o => o.id !== req.params.id);
  saveData();
  res.json({ message: '删除组织成功', data: { id: req.params.id } });
});

app.get('/api/roles', authenticateToken, (req, res) => {
  const roles = data.roles.filter(r => r.tenantId === req.user.tenantId);
  res.json({ data: roles });
});

app.post('/api/roles', authenticateToken, (req, res) => {
  const role = { id: `role-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.roles.push(role);
  saveData();
  res.json({ message: '新增角色成功', data: role });
});

app.put('/api/roles/:id', authenticateToken, (req, res) => {
  const index = data.roles.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    data.roles[index] = { ...data.roles[index], ...req.body };
    saveData();
    res.json({ message: '更新角色成功', data: data.roles[index] });
  } else {
    res.status(404).json({ message: '角色不存在' });
  }
});

app.delete('/api/roles/:id', authenticateToken, (req, res) => {
  const role = data.roles.find(r => r.id === req.params.id);
  if (!role) {
    return res.status(404).json({ message: '角色不存在' });
  }
  data.roles = data.roles.filter(r => r.id !== req.params.id);
  saveData();
  res.json({ message: '删除角色成功', data: { id: req.params.id } });
});

app.get('/api/users', authenticateToken, (req, res) => {
  const users = data.users.filter(u => u.tenantId === req.user.tenantId).map(u => ({
    ...u,
    organization: data.organizations.find(o => o.id === u.orgId),
    role: data.roles.find(r => r.id === u.roleId)
  }));
  res.json({ data: users });
});

app.post('/api/users', authenticateToken, async (req, res) => {
  const existingUser = data.users.find(u => u.username === req.body.username && u.tenantId === req.user.tenantId);
  if (existingUser) {
    return res.status(400).json({ message: '用户名已存在' });
  }
  const hashedPassword = await bcrypt.hash(req.body.password || '123456', 10);
  const user = { id: `user-${Date.now()}`, tenantId: req.user.tenantId, password: hashedPassword, ...req.body };
  data.users.push(user);
  saveData();
  res.json({ message: '新增用户成功', data: user });
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const index = data.users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    if (req.body.username) {
      const existingUser = data.users.find(u => u.username === req.body.username && u.id !== req.params.id && u.tenantId === req.user.tenantId);
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
    data.users[index] = { ...data.users[index], ...req.body };
    saveData();
    res.json({ message: '更新用户成功', data: data.users[index] });
  } else {
    res.status(404).json({ message: '用户不存在' });
  }
});

app.delete('/api/users/:id', authenticateToken, (req, res) => {
  const user = data.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  data.users = data.users.filter(u => u.id !== req.params.id);
  saveData();
  res.json({ message: '删除用户成功', data: { id: req.params.id } });
});

app.get('/api/accounts', authenticateToken, (req, res) => {
  const accounts = data.accounts.filter(a => a.tenantId === req.user.tenantId).map(a => ({
    ...a,
    parent: data.accounts.find(p => p.id === a.parentId)
  }));
  res.json({ data: accounts });
});

app.get('/api/accounts/tree', authenticateToken, (req, res) => {
  const accs = data.accounts.filter(a => a.tenantId === req.user.tenantId);
  const tree = accs.filter(a => !a.parentId).map(a => ({
    ...a,
    children: accs.filter(c => c.parentId === a.id),
    parent: null
  }));
  res.json({ data: tree });
});

app.get('/api/accounts/balance', authenticateToken, (req, res) => {
  const balances = data.accounts.filter(a => !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) {
          voucherEntries.push(e);
        }
      });
    });
    const debit = voucherEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = voucherEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    const balance = a.category === 'asset' || a.category === 'expense' ? debit - credit : credit - debit;
    return { id: a.id, code: a.code, name: a.name, debit, credit, balance };
  });
  res.json({ data: balances });
});

app.post('/api/accounts', authenticateToken, (req, res) => {
  const acc = { id: `acc-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.accounts.push(acc);
  saveData();
  res.json({ message: '新增科目成功', data: acc });
});

app.put('/api/accounts/:id', authenticateToken, (req, res) => {
  const index = data.accounts.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    data.accounts[index] = { ...data.accounts[index], ...req.body };
    saveData();
    res.json({ message: '更新科目成功', data: data.accounts[index] });
  } else {
    res.status(404).json({ message: '科目不存在' });
  }
});

app.delete('/api/accounts/:id', authenticateToken, (req, res) => {
  const acc = data.accounts.find(a => a.id === req.params.id);
  if (!acc) {
    return res.status(404).json({ message: '科目不存在' });
  }
  data.accounts = data.accounts.filter(a => a.id !== req.params.id);
  saveData();
  res.json({ message: '删除科目成功', data: { id: req.params.id } });
});

app.get('/api/customers', authenticateToken, (req, res) => {
  const customers = data.customers.filter(c => c.tenantId === req.user.tenantId);
  res.json({ data: customers });
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const customer = { id: `cust-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.customers.push(customer);
  saveData();
  res.json({ message: '新增客户成功', data: customer });
});

app.put('/api/customers/:id', authenticateToken, (req, res) => {
  const index = data.customers.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    data.customers[index] = { ...data.customers[index], ...req.body };
    saveData();
    res.json({ message: '更新客户成功', data: data.customers[index] });
  } else {
    res.status(404).json({ message: '客户不存在' });
  }
});

app.delete('/api/customers/:id', authenticateToken, (req, res) => {
  const customer = data.customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ message: '客户不存在' });
  }
  data.customers = data.customers.filter(c => c.id !== req.params.id);
  saveData();
  res.json({ message: '删除客户成功', data: { id: req.params.id } });
});

app.get('/api/suppliers', authenticateToken, (req, res) => {
  const suppliers = data.suppliers.filter(s => s.tenantId === req.user.tenantId);
  res.json({ data: suppliers });
});

app.post('/api/suppliers', authenticateToken, (req, res) => {
  const supplier = { id: `sup-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.suppliers.push(supplier);
  saveData();
  res.json({ message: '新增供应商成功', data: supplier });
});

app.put('/api/suppliers/:id', authenticateToken, (req, res) => {
  const index = data.suppliers.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    data.suppliers[index] = { ...data.suppliers[index], ...req.body };
    saveData();
    res.json({ message: '更新供应商成功', data: data.suppliers[index] });
  } else {
    res.status(404).json({ message: '供应商不存在' });
  }
});

app.delete('/api/suppliers/:id', authenticateToken, (req, res) => {
  const supplier = data.suppliers.find(s => s.id === req.params.id);
  if (!supplier) {
    return res.status(404).json({ message: '供应商不存在' });
  }
  data.suppliers = data.suppliers.filter(s => s.id !== req.params.id);
  saveData();
  res.json({ message: '删除供应商成功', data: { id: req.params.id } });
});

app.get('/api/materials', authenticateToken, (req, res) => {
  const materials = data.materials.filter(m => m.tenantId === req.user.tenantId);
  res.json({ data: materials });
});

app.post('/api/materials', authenticateToken, (req, res) => {
  const material = { id: `mat-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.materials.push(material);
  saveData();
  res.json({ message: '新增物料成功', data: material });
});

app.put('/api/materials/:id', authenticateToken, (req, res) => {
  const index = data.materials.findIndex(m => m.id === req.params.id);
  if (index !== -1) {
    data.materials[index] = { ...data.materials[index], ...req.body };
    saveData();
    res.json({ message: '更新物料成功', data: data.materials[index] });
  } else {
    res.status(404).json({ message: '物料不存在' });
  }
});

app.delete('/api/materials/:id', authenticateToken, (req, res) => {
  const material = data.materials.find(m => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ message: '物料不存在' });
  }
  data.materials = data.materials.filter(m => m.id !== req.params.id);
  saveData();
  res.json({ message: '删除物料成功', data: { id: req.params.id } });
});

app.get('/api/warehouses', authenticateToken, (req, res) => {
  const warehouses = data.warehouses.filter(w => w.tenantId === req.user.tenantId);
  res.json({ data: warehouses });
});

app.post('/api/warehouses', authenticateToken, (req, res) => {
  const warehouse = { id: `wh-${Date.now()}`, tenantId: req.user.tenantId, ...req.body };
  data.warehouses.push(warehouse);
  saveData();
  res.json({ message: '新增仓库成功', data: warehouse });
});

app.put('/api/warehouses/:id', authenticateToken, (req, res) => {
  const index = data.warehouses.findIndex(w => w.id === req.params.id);
  if (index !== -1) {
    data.warehouses[index] = { ...data.warehouses[index], ...req.body };
    saveData();
    res.json({ message: '更新仓库成功', data: data.warehouses[index] });
  } else {
    res.status(404).json({ message: '仓库不存在' });
  }
});

app.delete('/api/warehouses/:id', authenticateToken, (req, res) => {
  const warehouse = data.warehouses.find(w => w.id === req.params.id);
  if (!warehouse) {
    return res.status(404).json({ message: '仓库不存在' });
  }
  data.warehouses = data.warehouses.filter(w => w.id !== req.params.id);
  saveData();
  res.json({ message: '删除仓库成功', data: { id: req.params.id } });
});

app.get('/api/vouchers', authenticateToken, (req, res) => {
  const vouchers = data.vouchers.filter(v => v.tenantId === req.user.tenantId).map(v => ({
    ...v,
    number: v.code,
    creator: data.users.find(u => u.id === v.creatorId),
    approver: data.users.find(u => u.id === v.approverId)
  }));
  res.json({ data: vouchers });
});

app.post('/api/vouchers', authenticateToken, (req, res) => {
  const voucher = { id: `vou-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', entries: [], ...req.body };
  data.vouchers.push(voucher);
  saveData();
  res.json({ message: '新增凭证成功', data: voucher });
});

app.put('/api/vouchers/:id/approve', authenticateToken, (req, res) => {
  const index = data.vouchers.findIndex(v => v.id === req.params.id);
  if (index !== -1) {
    data.vouchers[index].status = 'approved';
    data.vouchers[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核凭证成功', data: data.vouchers[index] });
  } else {
    res.status(404).json({ message: '凭证不存在' });
  }
});

app.delete('/api/vouchers/:id', authenticateToken, (req, res) => {
  const voucher = data.vouchers.find(v => v.id === req.params.id);
  if (!voucher) {
    return res.status(404).json({ message: '凭证不存在' });
  }
  data.vouchers = data.vouchers.filter(v => v.id !== req.params.id);
  saveData();
  res.json({ message: '删除凭证成功', data: { id: req.params.id } });
});

app.get('/api/purchase-orders', authenticateToken, (req, res) => {
  const orders = data.purchaseOrders.filter(po => po.tenantId === req.user.tenantId).map(po => ({
    ...po,
    supplier: data.suppliers.find(s => s.id === po.supplierId),
    warehouse: data.warehouses.find(w => w.id === po.warehouseId),
    creator: data.users.find(u => u.id === po.creatorId),
    items: po.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: orders });
});

app.post('/api/purchase-orders', authenticateToken, (req, res) => {
  const order = { id: `po-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.purchaseOrders.push(order);
  saveData();
  res.json({ message: '新增采购订单成功', data: order });
});

app.put('/api/purchase-orders/:id/approve', authenticateToken, (req, res) => {
  const index = data.purchaseOrders.findIndex(po => po.id === req.params.id);
  if (index !== -1) {
    data.purchaseOrders[index].status = 'approved';
    data.purchaseOrders[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核采购订单成功', data: data.purchaseOrders[index] });
  } else {
    res.status(404).json({ message: '采购订单不存在' });
  }
});

app.put('/api/purchase-orders/:id/receive', authenticateToken, (req, res) => {
  const index = data.purchaseOrders.findIndex(po => po.id === req.params.id);
  if (index !== -1) {
    const order = data.purchaseOrders[index];
    order.items.forEach(item => {
      item.receivedQty = item.quantity;
    });
    order.status = 'completed';
    saveData();
    res.json({ message: '采购入库成功', data: order });
  } else {
    res.status(404).json({ message: '采购订单不存在' });
  }
});

app.delete('/api/purchase-orders/:id', authenticateToken, (req, res) => {
  const order = data.purchaseOrders.find(po => po.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '采购订单不存在' });
  }
  data.purchaseOrders = data.purchaseOrders.filter(po => po.id !== req.params.id);
  saveData();
  res.json({ message: '删除采购订单成功', data: { id: req.params.id } });
});

app.get('/api/sale-orders', authenticateToken, (req, res) => {
  const orders = data.saleOrders.filter(so => so.tenantId === req.user.tenantId).map(so => ({
    ...so,
    customer: data.customers.find(c => c.id === so.customerId),
    warehouse: data.warehouses.find(w => w.id === so.warehouseId),
    creator: data.users.find(u => u.id === so.creatorId),
    items: so.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: orders });
});

app.post('/api/sale-orders', authenticateToken, (req, res) => {
  const order = { id: `so-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.saleOrders.push(order);
  saveData();
  res.json({ message: '新增销售订单成功', data: order });
});

app.put('/api/sale-orders/:id/approve', authenticateToken, (req, res) => {
  const index = data.saleOrders.findIndex(so => so.id === req.params.id);
  if (index !== -1) {
    data.saleOrders[index].status = 'approved';
    data.saleOrders[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核销售订单成功', data: data.saleOrders[index] });
  } else {
    res.status(404).json({ message: '销售订单不存在' });
  }
});

app.put('/api/sale-orders/:id/ship', authenticateToken, (req, res) => {
  const index = data.saleOrders.findIndex(so => so.id === req.params.id);
  if (index !== -1) {
    const order = data.saleOrders[index];
    order.items.forEach(item => {
      item.shippedQty = item.quantity;
    });
    order.status = 'completed';
    saveData();
    res.json({ message: '销售出库成功', data: order });
  } else {
    res.status(404).json({ message: '销售订单不存在' });
  }
});

app.delete('/api/sale-orders/:id', authenticateToken, (req, res) => {
  const order = data.saleOrders.find(so => so.id === req.params.id);
  if (!order) {
    return res.status(404).json({ message: '销售订单不存在' });
  }
  data.saleOrders = data.saleOrders.filter(so => so.id !== req.params.id);
  saveData();
  res.json({ message: '删除销售订单成功', data: { id: req.params.id } });
});

app.get('/api/inventories', authenticateToken, (req, res) => {
  const inventories = data.inventories.filter(i => i.tenantId === req.user.tenantId).map(i => ({
    ...i,
    warehouse: data.warehouses.find(w => w.id === i.warehouseId),
    material: data.materials.find(m => m.id === i.materialId)
  }));
  res.json({ data: inventories });
});

app.get('/api/transfers', authenticateToken, (req, res) => {
  const transfers = data.transfers.filter(t => t.tenantId === req.user.tenantId).map(t => ({
    ...t,
    fromWarehouse: data.warehouses.find(w => w.id === t.fromWarehouseId),
    toWarehouse: data.warehouses.find(w => w.id === t.toWarehouseId),
    creator: data.users.find(u => u.id === t.creatorId)
  }));
  res.json({ data: transfers });
});

app.post('/api/transfers', authenticateToken, (req, res) => {
  const transfer = { id: `tf-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', ...req.body };
  data.transfers.push(transfer);
  saveData();
  res.json({ message: '新增调拨单成功', data: transfer });
});

app.put('/api/transfers/:id/approve', authenticateToken, (req, res) => {
  const index = data.transfers.findIndex(t => t.id === req.params.id);
  if (index !== -1) {
    data.transfers[index].status = 'approved';
    data.transfers[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核调拨单成功', data: data.transfers[index] });
  } else {
    res.status(404).json({ message: '调拨单不存在' });
  }
});

app.delete('/api/transfers/:id', authenticateToken, (req, res) => {
  const transfer = data.transfers.find(t => t.id === req.params.id);
  if (!transfer) {
    return res.status(404).json({ message: '调拨单不存在' });
  }
  data.transfers = data.transfers.filter(t => t.id !== req.params.id);
  saveData();
  res.json({ message: '删除调拨单成功', data: { id: req.params.id } });
});

app.get('/api/receivables', authenticateToken, (req, res) => {
  const receivables = data.receivables.filter(r => r.tenantId === req.user.tenantId).map(r => ({
    ...r,
    customer: data.customers.find(c => c.id === r.customerId),
    saleOrder: data.saleOrders.find(so => so.id === r.saleOrderId)
  }));
  res.json({ data: receivables });
});

app.get('/api/receivables/summary', authenticateToken, (req, res) => {
  const receivables = data.receivables.filter(r => r.tenantId === req.user.tenantId);
  const summary = {
    total: receivables.reduce((sum, r) => sum + r.amount, 0),
    pending: receivables.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    partial: receivables.filter(r => r.status === 'partial').reduce((sum, r) => sum + (r.amount - r.receivedAmount), 0),
    paid: receivables.reduce((sum, r) => sum + r.receivedAmount, 0)
  };
  res.json({ data: summary });
});

app.post('/api/receivables', authenticateToken, (req, res) => {
  const receivable = { id: `rec-${Date.now()}`, tenantId: req.user.tenantId, receivedAmount: 0, status: 'pending', ...req.body };
  data.receivables.push(receivable);
  saveData();
  res.json({ message: '新增应收款成功', data: receivable });
});

app.put('/api/receivables/:id/receive', authenticateToken, (req, res) => {
  const index = data.receivables.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    const receivable = data.receivables[index];
    receivable.receivedAmount += req.body.amount || 0;
    if (receivable.receivedAmount >= receivable.amount) {
      receivable.receivedAmount = receivable.amount;
      receivable.status = 'paid';
    } else {
      receivable.status = 'partial';
    }
    saveData();
    res.json({ message: '收款成功', data: receivable });
  } else {
    res.status(404).json({ message: '应收款不存在' });
  }
});

app.delete('/api/receivables/:id', authenticateToken, (req, res) => {
  const receivable = data.receivables.find(r => r.id === req.params.id);
  if (!receivable) {
    return res.status(404).json({ message: '应收款不存在' });
  }
  data.receivables = data.receivables.filter(r => r.id !== req.params.id);
  saveData();
  res.json({ message: '删除应收款成功', data: { id: req.params.id } });
});

app.get('/api/payables', authenticateToken, (req, res) => {
  const payables = data.payables.filter(p => p.tenantId === req.user.tenantId).map(p => ({
    ...p,
    supplier: data.suppliers.find(s => s.id === p.supplierId),
    purchaseOrder: data.purchaseOrders.find(po => po.id === p.purchaseOrderId)
  }));
  res.json({ data: payables });
});

app.get('/api/payables/summary', authenticateToken, (req, res) => {
  const payables = data.payables.filter(p => p.tenantId === req.user.tenantId);
  const summary = {
    total: payables.reduce((sum, p) => sum + p.amount, 0),
    pending: payables.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    partial: payables.filter(p => p.status === 'partial').reduce((sum, p) => sum + (p.amount - p.paidAmount), 0),
    paid: payables.reduce((sum, p) => sum + p.paidAmount, 0)
  };
  res.json({ data: summary });
});

app.post('/api/payables', authenticateToken, (req, res) => {
  const payable = { id: `pay-${Date.now()}`, tenantId: req.user.tenantId, paidAmount: 0, status: 'pending', ...req.body };
  data.payables.push(payable);
  saveData();
  res.json({ message: '新增应付款成功', data: payable });
});

app.put('/api/payables/:id/pay', authenticateToken, (req, res) => {
  const index = data.payables.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    const payable = data.payables[index];
    payable.paidAmount += req.body.amount || 0;
    if (payable.paidAmount >= payable.amount) {
      payable.paidAmount = payable.amount;
      payable.status = 'paid';
    } else {
      payable.status = 'partial';
    }
    saveData();
    res.json({ message: '付款成功', data: payable });
  } else {
    res.status(404).json({ message: '应付款不存在' });
  }
});

app.delete('/api/payables/:id', authenticateToken, (req, res) => {
  const payable = data.payables.find(p => p.id === req.params.id);
  if (!payable) {
    return res.status(404).json({ message: '应付款不存在' });
  }
  data.payables = data.payables.filter(p => p.id !== req.params.id);
  saveData();
  res.json({ message: '删除应付款成功', data: { id: req.params.id } });
});

app.get('/api/reports/balance-sheet', authenticateToken, (req, res) => {
  const assets = data.accounts.filter(a => a.category === 'asset' && !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) voucherEntries.push(e);
      });
    });
    const debit = voucherEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = voucherEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { code: a.code, name: a.name, balance: debit - credit };
  });

  const liabilities = data.accounts.filter(a => a.category === 'liability' && !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) voucherEntries.push(e);
      });
    });
    const debit = voucherEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = voucherEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { code: a.code, name: a.name, balance: credit - debit };
  });

  const equity = data.accounts.filter(a => a.category === 'equity' && !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) voucherEntries.push(e);
      });
    });
    const debit = voucherEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credit = voucherEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { code: a.code, name: a.name, balance: credit - debit };
  });

  const balanceSheet = {
    assets: { total: assets.reduce((sum, a) => sum + a.balance, 0), items: assets },
    liabilities: { total: liabilities.reduce((sum, l) => sum + Math.abs(l.balance), 0), items: liabilities },
    equity: { total: equity.reduce((sum, e) => sum + Math.abs(e.balance), 0), items: equity }
  };

  res.json({ data: balanceSheet });
});

app.get('/api/reports/income-statement', authenticateToken, (req, res) => {
  const income = data.accounts.filter(a => a.category === 'income' && !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) voucherEntries.push(e);
      });
    });
    const amount = voucherEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { code: a.code, name: a.name, amount };
  });

  const expense = data.accounts.filter(a => a.category === 'expense' && !a.parentId && a.tenantId === req.user.tenantId).map(a => {
    const voucherEntries = [];
    data.vouchers.forEach(v => {
      v.entries.forEach(e => {
        if (e.accountId === a.id) voucherEntries.push(e);
      });
    });
    const amount = voucherEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
    return { code: a.code, name: a.name, amount };
  });

  const incomeStatement = {
    income: { total: income.reduce((sum, i) => sum + i.amount, 0), items: income },
    expense: { total: expense.reduce((sum, e) => sum + e.amount, 0), items: expense },
    profit: income.reduce((sum, i) => sum + i.amount, 0) - expense.reduce((sum, e) => sum + e.amount, 0)
  };

  res.json({ data: incomeStatement });
});

app.get('/api/reports/inventory', authenticateToken, (req, res) => {
  const report = data.inventories.filter(i => i.tenantId === req.user.tenantId).map(i => ({
    ...i,
    warehouse: data.warehouses.find(w => w.id === i.warehouseId),
    material: data.materials.find(m => m.id === i.materialId)
  }));
  res.json({ data: report });
});

app.get('/api/reports/purchase', authenticateToken, (req, res) => {
  const report = data.purchaseOrders.filter(po => po.tenantId === req.user.tenantId).map(po => ({
    id: po.id,
    number: po.number,
    supplierName: data.suppliers.find(s => s.id === po.supplierId)?.name || '',
    totalAmount: po.totalAmount,
    status: po.status
  }));
  res.json({ data: report });
});

app.get('/api/reports/sale', authenticateToken, (req, res) => {
  const report = data.saleOrders.filter(so => so.tenantId === req.user.tenantId).map(so => ({
    id: so.id,
    number: so.number,
    customerName: data.customers.find(c => c.id === so.customerId)?.name || '',
    totalAmount: so.totalAmount,
    status: so.status
  }));
  res.json({ data: report });
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  const tenantId = req.user.tenantId;
  
  const dashboard = {
    purchaseCount: data.purchaseOrders.filter(po => po.tenantId === tenantId).length,
    saleCount: data.saleOrders.filter(so => so.tenantId === tenantId).length,
    inventoryCount: data.inventories.filter(i => i.tenantId === tenantId).length,
    totalInventoryValue: data.inventories.filter(i => i.tenantId === tenantId).reduce((sum, i) => {
      const material = data.materials.find(m => m.id === i.materialId);
      return sum + (material?.price || 0) * i.quantity;
    }, 0),
    receivableTotal: data.receivables.filter(r => r.tenantId === tenantId).reduce((sum, r) => sum + r.amount, 0),
    receivablePending: data.receivables.filter(r => r.tenantId === tenantId && r.status !== 'paid').reduce((sum, r) => sum + (r.amount - r.receivedAmount), 0),
    payableTotal: data.payables.filter(p => p.tenantId === tenantId).reduce((sum, p) => sum + p.amount, 0),
    payablePending: data.payables.filter(p => p.tenantId === tenantId && p.status !== 'paid').reduce((sum, p) => sum + (p.amount - p.paidAmount), 0),
    voucherCount: data.vouchers.filter(v => v.tenantId === tenantId).length
  };

  res.json({ data: dashboard });
});

app.get('/api/purchase-receipts', authenticateToken, (req, res) => {
  const receipts = data.purchaseReceipts.filter(pr => pr.tenantId === req.user.tenantId).map(pr => ({
    ...pr,
    purchaseOrder: data.purchaseOrders.find(po => po.id === pr.purchaseOrderId),
    warehouse: data.warehouses.find(w => w.id === pr.warehouseId),
    supplier: data.suppliers.find(s => s.id === pr.supplierId),
    items: pr.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: receipts });
});

app.post('/api/purchase-receipts', authenticateToken, (req, res) => {
  const receipt = { id: `pr-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.purchaseReceipts.push(receipt);
  saveData();
  res.json({ message: '新增采购入库单成功', data: receipt });
});

app.put('/api/purchase-receipts/:id/approve', authenticateToken, (req, res) => {
  const index = data.purchaseReceipts.findIndex(pr => pr.id === req.params.id);
  if (index !== -1) {
    data.purchaseReceipts[index].status = 'approved';
    data.purchaseReceipts[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核采购入库单成功', data: data.purchaseReceipts[index] });
  } else {
    res.status(404).json({ message: '采购入库单不存在' });
  }
});

app.put('/api/purchase-receipts/:id/complete', authenticateToken, (req, res) => {
  const index = data.purchaseReceipts.findIndex(pr => pr.id === req.params.id);
  if (index !== -1) {
    data.purchaseReceipts[index].status = 'completed';
    saveData();
    res.json({ message: '采购入库完成', data: data.purchaseReceipts[index] });
  } else {
    res.status(404).json({ message: '采购入库单不存在' });
  }
});

app.delete('/api/purchase-receipts/:id', authenticateToken, (req, res) => {
  const receipt = data.purchaseReceipts.find(pr => pr.id === req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: '采购入库单不存在' });
  }
  data.purchaseReceipts = data.purchaseReceipts.filter(pr => pr.id !== req.params.id);
  saveData();
  res.json({ message: '删除采购入库单成功', data: { id: req.params.id } });
});

app.get('/api/sale-deliveries', authenticateToken, (req, res) => {
  const deliveries = data.saleDeliveries.filter(sd => sd.tenantId === req.user.tenantId).map(sd => ({
    ...sd,
    saleOrder: data.saleOrders.find(so => so.id === sd.saleOrderId),
    warehouse: data.warehouses.find(w => w.id === sd.warehouseId),
    customer: data.customers.find(c => c.id === sd.customerId),
    items: sd.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: deliveries });
});

app.post('/api/sale-deliveries', authenticateToken, (req, res) => {
  const delivery = { id: `sd-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.saleDeliveries.push(delivery);
  saveData();
  res.json({ message: '新增销售出库单成功', data: delivery });
});

app.put('/api/sale-deliveries/:id/approve', authenticateToken, (req, res) => {
  const index = data.saleDeliveries.findIndex(sd => sd.id === req.params.id);
  if (index !== -1) {
    data.saleDeliveries[index].status = 'approved';
    data.saleDeliveries[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核销售出库单成功', data: data.saleDeliveries[index] });
  } else {
    res.status(404).json({ message: '销售出库单不存在' });
  }
});

app.put('/api/sale-deliveries/:id/complete', authenticateToken, (req, res) => {
  const index = data.saleDeliveries.findIndex(sd => sd.id === req.params.id);
  if (index !== -1) {
    data.saleDeliveries[index].status = 'completed';
    saveData();
    res.json({ message: '销售出库完成', data: data.saleDeliveries[index] });
  } else {
    res.status(404).json({ message: '销售出库单不存在' });
  }
});

app.delete('/api/sale-deliveries/:id', authenticateToken, (req, res) => {
  const delivery = data.saleDeliveries.find(sd => sd.id === req.params.id);
  if (!delivery) {
    return res.status(404).json({ message: '销售出库单不存在' });
  }
  data.saleDeliveries = data.saleDeliveries.filter(sd => sd.id !== req.params.id);
  saveData();
  res.json({ message: '删除销售出库单成功', data: { id: req.params.id } });
});

app.get('/api/production-pickings', authenticateToken, (req, res) => {
  const pickings = data.productionPickings.filter(pp => pp.tenantId === req.user.tenantId).map(pp => ({
    ...pp,
    productionOrder: data.productionOrders.find(po => po.id === pp.productionOrderId),
    warehouse: data.warehouses.find(w => w.id === pp.warehouseId),
    items: pp.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: pickings });
});

app.post('/api/production-pickings', authenticateToken, (req, res) => {
  const picking = { id: `pp-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.productionPickings.push(picking);
  saveData();
  res.json({ message: '新增生产领料单成功', data: picking });
});

app.put('/api/production-pickings/:id/approve', authenticateToken, (req, res) => {
  const index = data.productionPickings.findIndex(pp => pp.id === req.params.id);
  if (index !== -1) {
    data.productionPickings[index].status = 'approved';
    data.productionPickings[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核生产领料单成功', data: data.productionPickings[index] });
  } else {
    res.status(404).json({ message: '生产领料单不存在' });
  }
});

app.put('/api/production-pickings/:id/complete', authenticateToken, (req, res) => {
  const index = data.productionPickings.findIndex(pp => pp.id === req.params.id);
  if (index !== -1) {
    data.productionPickings[index].status = 'completed';
    saveData();
    res.json({ message: '生产领料完成', data: data.productionPickings[index] });
  } else {
    res.status(404).json({ message: '生产领料单不存在' });
  }
});

app.delete('/api/production-pickings/:id', authenticateToken, (req, res) => {
  const picking = data.productionPickings.find(pp => pp.id === req.params.id);
  if (!picking) {
    return res.status(404).json({ message: '生产领料单不存在' });
  }
  data.productionPickings = data.productionPickings.filter(pp => pp.id !== req.params.id);
  saveData();
  res.json({ message: '删除生产领料单成功', data: { id: req.params.id } });
});

app.get('/api/production-returns', authenticateToken, (req, res) => {
  const returns = data.productionReturns.filter(prt => prt.tenantId === req.user.tenantId).map(prt => ({
    ...prt,
    productionOrder: data.productionOrders.find(po => po.id === prt.productionOrderId),
    warehouse: data.warehouses.find(w => w.id === prt.warehouseId),
    items: prt.items.map(item => ({
      ...item,
      material: data.materials.find(m => m.id === item.materialId)
    }))
  }));
  res.json({ data: returns });
});

app.post('/api/production-returns', authenticateToken, (req, res) => {
  const returnItem = { id: `prt-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', items: [], ...req.body };
  data.productionReturns.push(returnItem);
  saveData();
  res.json({ message: '新增生产退料单成功', data: returnItem });
});

app.put('/api/production-returns/:id/approve', authenticateToken, (req, res) => {
  const index = data.productionReturns.findIndex(prt => prt.id === req.params.id);
  if (index !== -1) {
    data.productionReturns[index].status = 'approved';
    data.productionReturns[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核生产退料单成功', data: data.productionReturns[index] });
  } else {
    res.status(404).json({ message: '生产退料单不存在' });
  }
});

app.put('/api/production-returns/:id/complete', authenticateToken, (req, res) => {
  const index = data.productionReturns.findIndex(prt => prt.id === req.params.id);
  if (index !== -1) {
    data.productionReturns[index].status = 'completed';
    saveData();
    res.json({ message: '生产退料完成', data: data.productionReturns[index] });
  } else {
    res.status(404).json({ message: '生产退料单不存在' });
  }
});

app.delete('/api/production-returns/:id', authenticateToken, (req, res) => {
  const returnItem = data.productionReturns.find(prt => prt.id === req.params.id);
  if (!returnItem) {
    return res.status(404).json({ message: '生产退料单不存在' });
  }
  data.productionReturns = data.productionReturns.filter(prt => prt.id !== req.params.id);
  saveData();
  res.json({ message: '删除生产退料单成功', data: { id: req.params.id } });
});

app.get('/api/receipts', authenticateToken, (req, res) => {
  const receipts = data.receipts.filter(r => r.tenantId === req.user.tenantId).map(r => ({
    ...r,
    receivable: data.receivables.find(rec => rec.id === r.receivableId),
    customer: data.customers.find(c => c.id === r.customerId),
    voucher: data.vouchers.find(v => v.id === r.linkedVoucherId)
  }));
  res.json({ data: receipts });
});

app.post('/api/receipts', authenticateToken, (req, res) => {
  const receipt = { id: `rcpt-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', ...req.body };
  data.receipts.push(receipt);
  saveData();
  res.json({ message: '新增收款单成功', data: receipt });
});

app.put('/api/receipts/:id/approve', authenticateToken, (req, res) => {
  const index = data.receipts.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    data.receipts[index].status = 'approved';
    data.receipts[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核收款单成功', data: data.receipts[index] });
  } else {
    res.status(404).json({ message: '收款单不存在' });
  }
});

app.put('/api/receipts/:id/complete', authenticateToken, (req, res) => {
  const index = data.receipts.findIndex(r => r.id === req.params.id);
  if (index !== -1) {
    data.receipts[index].status = 'completed';
    saveData();
    res.json({ message: '收款完成', data: data.receipts[index] });
  } else {
    res.status(404).json({ message: '收款单不存在' });
  }
});

app.delete('/api/receipts/:id', authenticateToken, (req, res) => {
  const receipt = data.receipts.find(r => r.id === req.params.id);
  if (!receipt) {
    return res.status(404).json({ message: '收款单不存在' });
  }
  data.receipts = data.receipts.filter(r => r.id !== req.params.id);
  saveData();
  res.json({ message: '删除收款单成功', data: { id: req.params.id } });
});

app.get('/api/payments', authenticateToken, (req, res) => {
  const payments = data.payments.filter(p => p.tenantId === req.user.tenantId).map(p => ({
    ...p,
    payable: data.payables.find(pay => pay.id === p.payableId),
    supplier: data.suppliers.find(s => s.id === p.supplierId),
    voucher: data.vouchers.find(v => v.id === p.linkedVoucherId)
  }));
  res.json({ data: payments });
});

app.post('/api/payments', authenticateToken, (req, res) => {
  const payment = { id: `pmt-${Date.now()}`, tenantId: req.user.tenantId, creatorId: req.user.userId, status: 'draft', ...req.body };
  data.payments.push(payment);
  saveData();
  res.json({ message: '新增付款单成功', data: payment });
});

app.put('/api/payments/:id/approve', authenticateToken, (req, res) => {
  const index = data.payments.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    data.payments[index].status = 'approved';
    data.payments[index].approverId = req.user.userId;
    saveData();
    res.json({ message: '审核付款单成功', data: data.payments[index] });
  } else {
    res.status(404).json({ message: '付款单不存在' });
  }
});

app.put('/api/payments/:id/complete', authenticateToken, (req, res) => {
  const index = data.payments.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    data.payments[index].status = 'completed';
    saveData();
    res.json({ message: '付款完成', data: data.payments[index] });
  } else {
    res.status(404).json({ message: '付款单不存在' });
  }
});

app.delete('/api/payments/:id', authenticateToken, (req, res) => {
  const payment = data.payments.find(p => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ message: '付款单不存在' });
  }
  data.payments = data.payments.filter(p => p.id !== req.params.id);
  saveData();
  res.json({ message: '删除付款单成功', data: { id: req.params.id } });
});

app.post('/api/reset', authenticateToken, (req, res) => {
  try {
    data = JSON.parse(fs.readFileSync(INIT_FILE, 'utf8'));
    saveData();
    res.json({ data: { message: 'Database reset successfully' } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset database', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ERP Backend Server running on http://localhost:${PORT}`);
});
