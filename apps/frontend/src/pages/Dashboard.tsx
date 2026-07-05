import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Tag, Progress, Statistic, Empty } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  InboxOutlined,
  DollarCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  LineChartOutlined,
  AimOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertCircleOutlined,
  TeamOutlined,
  UserOutlined,
  KeyOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { getDashboard } from '@/api/report';
import { getPurchaseOrders } from '@/api/purchase';
import { getSaleOrders } from '@/api/sale';
import { getInventories } from '@/api/inventory';

function AnimatedNumber({ value, suffix = '', prefix = '', decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{displayValue.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </motion.span>
  );
}

function StatCard({ 
  title, 
  value, 
  prefix, 
  suffix, 
  icon: Icon, 
  trend, 
  color,
  bgColor,
  delay = 0,
  onClick,
}: { 
  title: string; 
  value: number; 
  prefix?: string; 
  suffix?: string; 
  icon: any; 
  trend?: { value: number; up: boolean }; 
  color: string;
  bgColor: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Card
        className="glass-card stat-card"
        style={{
          borderLeft: `4px solid ${color}`,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-card)',
        }}
      >
        <motion.div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            background: `${bgColor}10`,
            borderRadius: '50%',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
            </div>
            {trend && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 8,
                  fontSize: 13,
                  color: trend.up ? '#10b981' : '#ef4444',
                  fontWeight: 500,
                }}
              >
                {trend.up ? <ArrowUpOutlined style={{ fontSize: 14 }} /> : <ArrowDownOutlined style={{ fontSize: 14 }} />}
                <span style={{ marginLeft: 4 }}>{trend.value}%</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>较上月</span>
              </motion.div>
            )}
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1 }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `${bgColor}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon style={{ fontSize: 28, color }} />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 40 }}>
      {data.map((value, index) => (
        <motion.div
          key={index}
          initial={{ height: 0 }}
          animate={{ height: `${((value - min) / (max - min || 1)) * 100}%`, minHeight: 4 }}
          transition={{ delay: index * 0.05, duration: 0.4 }}
          style={{
            width: 4,
            backgroundColor: color,
            borderRadius: 2,
            opacity: 0.3 + (index / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  );
}

function QuickAction({ title, icon: Icon, color, count, onClick }: { title: string; icon: any; color: string; count?: number; onClick?: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: '16px',
        background: 'var(--bg-card)',
        borderRadius: 12,
        border: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ fontSize: 20, color }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
        {count !== undefined && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count} 待处理</div>
        )}
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [saleOrders, setSaleOrders] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      user = {};
    }
    const tenantId = user.tenantId;

    if (tenantId) {
      Promise.all([
        getDashboard(tenantId),
        getPurchaseOrders(tenantId),
        getSaleOrders(tenantId),
        getInventories(tenantId),
      ])
        .then(([dashboardRes, purchaseRes, saleRes, inventoryRes]) => {
          setDashboardData(dashboardRes.data);
          setPurchaseOrders(purchaseRes.data.slice(0, 5));
          setSaleOrders(saleRes.data.slice(0, 5));
          setInventories(inventoryRes.data.slice(0, 5));
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, []);

  const statusMap: Record<string, { color: string; label: string }> = {
    draft: { color: 'default', label: '草稿' },
    approved: { color: 'processing', label: '已审核' },
    completed: { color: 'success', label: '已完成' },
  };

  const purchaseColumns = [
    { title: '订单编号', dataIndex: 'number', key: 'number', width: 140, ellipsis: true },
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier', width: 140, ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 130, render: (v: number) => <span style={{ fontWeight: 600, color: '#5b4ef9' }}>¥{v.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={statusMap[s]?.color} style={{ borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{statusMap[s]?.label}</Tag> },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  const saleColumns = [
    { title: '订单编号', dataIndex: 'number', key: 'number', width: 140, ellipsis: true },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer', width: 140, ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 130, render: (v: number) => <span style={{ fontWeight: 600, color: '#10b981' }}>¥{v.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => <Tag color={statusMap[s]?.color} style={{ borderRadius: 6, padding: '3px 10px', fontSize: 12 }}>{statusMap[s]?.label}</Tag> },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => new Date(d).toLocaleDateString() },
  ];

  const inventoryColumns = [
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse', width: 120 },
    { title: '物料', dataIndex: ['material', 'name'], key: 'material', width: 150, ellipsis: true },
    { title: '规格', dataIndex: ['material', 'spec'], key: 'spec', width: 100, ellipsis: true },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80, render: (v: number) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { title: '单位', dataIndex: ['material', 'unit'], key: 'unit', width: 60 },
  ];

  const quickActions = [
    { title: '组织架构', icon: TeamOutlined, color: '#8b5cf6', path: '/organization' },
    { title: '用户管理', icon: UserOutlined, color: '#6366f1', path: '/user' },
    { title: '角色权限', icon: KeyOutlined, color: '#3b82f6', path: '/role' },
    { title: '会计科目', icon: BookOutlined, color: '#0ea5e9', path: '/account' },
    { title: '客户管理', icon: CustomerServiceOutlined, color: '#06b6d4', path: '/customer' },
    { title: '供应商管理', icon: ShoppingCartOutlined, color: '#5b4ef9', path: '/supplier' },
    { title: '物料管理', icon: AppstoreOutlined, color: '#10b981', path: '/material' },
    { title: '仓库管理', icon: InboxOutlined, color: '#0891b2', path: '/warehouse' },
    { title: '采购管理', icon: ShoppingCartOutlined, color: '#f59e0b', path: '/purchase' },
    { title: '销售管理', icon: ShoppingOutlined, color: '#f97316', path: '/sale' },
    { title: '应收管理', icon: DollarCircleOutlined, color: '#ef4444', path: '/receivable' },
    { title: '应付管理', icon: LineChartOutlined, color: '#ec4899', path: '/payable' },
    { title: '库存管理', icon: InboxOutlined, color: '#84cc16', path: '/inventory' },
    { title: '凭证管理', icon: AimOutlined, color: '#eab308', path: '/voucher' },
    { title: '报表中心', icon: BarChartOutlined, color: '#06b6d4', path: '/report' },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <DashboardOutlined style={{ color: '#5b4ef9', fontSize: 24 }} />
        <span className="text-gradient">首页仪表盘</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="page-subtitle"
      >
        欢迎回来，{(() => { try { return JSON.parse(localStorage.getItem('user') || '{}')?.realName } catch { return '' } })() || '用户'}！这是您的业务概览。
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-grid"
        style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        <StatCard
          title="采购订单"
          value={dashboardData?.purchaseCount || 12}
          suffix="笔"
          icon={ShoppingCartOutlined}
          color="#5b4ef9"
          bgColor="#5b4ef9"
          trend={{ value: 12.5, up: true }}
          delay={0}
          onClick={() => navigate('/purchase')}
        />
        <StatCard
          title="销售订单"
          value={dashboardData?.saleCount || 18}
          suffix="笔"
          icon={ShoppingOutlined}
          color="#10b981"
          bgColor="#10b981"
          trend={{ value: 8.3, up: true }}
          delay={0.05}
          onClick={() => navigate('/sale')}
        />
        <StatCard
          title="库存物料"
          value={dashboardData?.inventoryCount || 45}
          suffix="种"
          icon={InboxOutlined}
          color="#0891b2"
          bgColor="#0891b2"
          trend={{ value: 5.2, up: true }}
          delay={0.1}
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="库存总值"
          value={dashboardData?.totalInventoryValue || 1256000}
          prefix="¥"
          icon={DollarCircleOutlined}
          color="#f59e0b"
          bgColor="#f59e0b"
          trend={{ value: 3.8, up: true }}
          delay={0.15}
          onClick={() => navigate('/inventory')}
        />
      </motion.div>

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
            className="glass-card" 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarCircleOutlined style={{ color: '#5b4ef9' }} />
                应收总额
              </span>
            }
            onClick={() => navigate('/receivable')}
            style={{ cursor: 'pointer' }}
          >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#5b4ef9', marginBottom: 4 }}>
                  <AnimatedNumber value={dashboardData?.receivableTotal || 850000} prefix="¥" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  待收金额 <span style={{ color: '#f59e0b', fontWeight: 600 }}>¥{(dashboardData?.receivablePending || 320000).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Progress
                    percent={Math.round(((dashboardData?.receivableTotal || 850000) - (dashboardData?.receivablePending || 320000)) / (dashboardData?.receivableTotal || 850000) * 100)}
                    size="small"
                    strokeColor="#5b4ef9"
                    trailColor="rgba(91, 78, 249, 0.1)"
                    strokeWidth={8}
                    format={(p) => `${p}% 已收`}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card 
            className="glass-card" 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LineChartOutlined style={{ color: '#10b981' }} />
                应付总额
              </span>
            }
            onClick={() => navigate('/payable')}
            style={{ cursor: 'pointer' }}
          >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#0891b2', marginBottom: 4 }}>
                  <AnimatedNumber value={dashboardData?.payableTotal || 620000} prefix="¥" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  待付金额 <span style={{ color: '#ef4444', fontWeight: 600 }}>¥{(dashboardData?.payablePending || 280000).toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Progress
                    percent={Math.round(((dashboardData?.payableTotal || 620000) - (dashboardData?.payablePending || 280000)) / (dashboardData?.payableTotal || 620000) * 100)}
                    size="small"
                    strokeColor="#0891b2"
                    trailColor="rgba(8, 145, 178, 0.1)"
                    strokeWidth={8}
                    format={(p) => `${p}% 已付`}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
            className="glass-card" 
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AimOutlined style={{ color: '#f59e0b' }} />
                凭证统计
              </span>
            }
            onClick={() => navigate('/voucher')}
            style={{ cursor: 'pointer' }}
          >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                  <AnimatedNumber value={dashboardData?.voucherCount || 45} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>张凭证</div>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div className="status-badge status-approved" style={{ padding: '6px 12px' }}>已审核</div>
                  <div className="status-badge status-draft" style={{ padding: '6px 12px' }}>草稿</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card"
        style={{ padding: 24, marginBottom: 24 }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AimOutlined style={{ color: '#5b4ef9' }} />
          模块导航
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              icon={action.icon}
              color={action.color}
              onClick={() => navigate(action.path)}
            />
          ))}
        </div>
      </motion.div>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              className="glass-card"
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCartOutlined style={{ color: '#5b4ef9' }} />
                  最近采购订单
                </span>
              }
              extra={
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    background: 'rgba(91, 78, 249, 0.1)',
                    color: '#5b4ef9',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => window.location.href = '/purchase'}
                >
                  查看全部
                </motion.button>
              }
            >
              {purchaseOrders.length > 0 ? (
                <Table
                  dataSource={purchaseOrders}
                  columns={purchaseColumns}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  style={{ marginTop: 8 }}
                  onRow={(record) => ({
                    style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = 'rgba(91, 78, 249, 0.04)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    },
                    onClick: () => navigate('/purchase'),
                  })}
                />
              ) : (
                <Empty description="暂无采购订单" />
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card
              className="glass-card"
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingOutlined style={{ color: '#10b981' }} />
                  最近销售订单
                </span>
              }
              extra={
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => window.location.href = '/sale'}
                >
                  查看全部
                </motion.button>
              }
            >
              {saleOrders.length > 0 ? (
                <Table
                  dataSource={saleOrders}
                  columns={saleColumns}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  style={{ marginTop: 8 }}
                  onRow={(record) => ({
                    style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = 'rgba(16, 185, 129, 0.04)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    },
                    onClick: () => navigate('/sale'),
                  })}
                />
              ) : (
                <Empty description="暂无销售订单" />
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              className="glass-card"
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InboxOutlined style={{ color: '#0891b2' }} />
                  库存概览
                </span>
              }
              extra={
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    background: 'rgba(8, 145, 178, 0.1)',
                    color: '#0891b2',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => window.location.href = '/inventory'}
                >
                  查看全部
                </motion.button>
              }
            >
              {inventories.length > 0 ? (
                <Table
                  dataSource={inventories}
                  columns={inventoryColumns}
                  pagination={false}
                  rowKey="id"
                  size="small"
                  style={{ marginTop: 8 }}
                  onRow={(record) => ({
                    style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                    onMouseEnter: (e) => {
                      e.currentTarget.style.background = 'rgba(8, 145, 178, 0.04)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    },
                    onMouseLeave: (e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    },
                    onClick: () => navigate('/inventory'),
                  })}
                />
              ) : (
                <Empty description="暂无库存数据" />
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;