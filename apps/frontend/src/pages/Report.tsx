import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Tabs, Tag } from 'antd';
import { motion } from 'framer-motion';
import { FileTextOutlined, BarChartOutlined, PieChartOutlined, ArrowUpOutlined, InboxOutlined, ShoppingCartOutlined, DollarCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { getBalanceSheet, getIncomeStatement, getInventoryReport, getPurchaseReport, getSaleReport } from '@/api/report';
import { getUserFromStorage } from '@/utils/storage';
import dayjs from 'dayjs';

type BalanceSheet = { assets: { total: number; items: { code: string; name: string; balance: number }[] }; liabilities: { total: number; items: { code: string; name: string; balance: number }[] }; equity: { total: number; items: { code: string; name: string; balance: number }[] } };
type IncomeStatement = { income: { total: number; items: { code: string; name: string; amount: number }[] }; expense: { total: number; items: { code: string; name: string; amount: number }[] }; profit: number };

function AnimatedNumber({ value, prefix = '¥' }: { value: number; prefix?: string }) {
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
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toFixed(2)}</span>;
}

function ReportPage() {
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [inventoryReport, setInventoryReport] = useState<any[]>([]);
  const [purchaseReport, setPurchaseReport] = useState<any[]>([]);
  const [saleReport, setSaleReport] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getBalanceSheet(user.tenantId).then(res => setBalanceSheet(res.data));
      getIncomeStatement(user.tenantId).then(res => setIncomeStatement(res.data));
      getInventoryReport(user.tenantId).then(res => setInventoryReport(res.data));
      getPurchaseReport(user.tenantId).then(res => setPurchaseReport(res.data));
      getSaleReport(user.tenantId).then(res => setSaleReport(res.data));
    }
  }, []);

  const balanceSheetColumns = [
    { title: '科目编码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '科目名称', dataIndex: 'name', key: 'name' },
    { title: '余额', dataIndex: 'balance', key: 'balance', width: 140, render: (v: number) => <span style={{ fontWeight: 500, color: '#4f46e5' }}>¥{v.toFixed(2)}</span> },
  ];

  const incomeStatementColumns = [
    { title: '科目编码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '科目名称', dataIndex: 'name', key: 'name' },
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 140, render: (v: number) => <span style={{ fontWeight: 500, color: '#4f46e5' }}>¥{v.toFixed(2)}</span> },
  ];

  const inventoryReportColumns = [
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '物料', dataIndex: ['material', 'name'], key: 'material' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 80 },
    { title: '单价', dataIndex: ['material', 'price'], key: 'price', width: 100, render: (v: number) => `¥${v.toFixed(2)}` },
    { title: '金额', key: 'amount', width: 120, render: (_: unknown, record: any) => <span style={{ fontWeight: 500, color: '#4f46e5' }}>¥{(record.quantity * record.material?.price).toFixed(2)}</span> },
  ];

  const purchaseReportColumns = [
    { title: '订单编号', dataIndex: 'number', key: 'number', width: 140 },
    { title: '供应商', dataIndex: 'supplierName', key: 'supplierName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: number) => <span style={{ fontWeight: 500, color: '#4f46e5' }}>¥{v.toFixed(2)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => (
      <Tag color={s === 'approved' ? 'success' : s === 'pending' ? 'processing' : 'default'} style={{ borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
        {s === 'approved' ? '已审核' : s === 'pending' ? '待审核' : '草稿'}
      </Tag>
    )},
  ];

  const saleReportColumns = [
    { title: '订单编号', dataIndex: 'number', key: 'number', width: 140 },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (v: number) => <span style={{ fontWeight: 500, color: '#4f46e5' }}>¥{v.toFixed(2)}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (s: string) => (
      <Tag color={s === 'approved' ? 'success' : s === 'pending' ? 'processing' : 'default'} style={{ borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
        {s === 'approved' ? '已审核' : s === 'pending' ? '待审核' : '草稿'}
      </Tag>
    )},
  ];

  const totalAssets = balanceSheet?.assets.total || 0;
  const totalLiabilities = balanceSheet?.liabilities.total || 0;
  const totalEquity = balanceSheet?.equity.total || 0;
  const totalIncome = incomeStatement?.income.total || 0;
  const totalExpense = incomeStatement?.expense.total || 0;
  const netProfit = incomeStatement?.profit || 0;

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <BarChartOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">报表中心</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-grid"
        style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #4f46e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>总资产</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>
                  <AnimatedNumber value={totalAssets} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChartOutlined style={{ fontSize: 24, color: '#4f46e5' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>总负债</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>
                  <AnimatedNumber value={totalLiabilities} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCardOutlined style={{ fontSize: 24, color: '#ef4444' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>所有者权益</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                  <AnimatedNumber value={totalEquity} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileTextOutlined style={{ fontSize: 24, color: '#10b981' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>营业收入</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                  <AnimatedNumber value={totalIncome} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>营业费用</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                  <AnimatedNumber value={totalExpense} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingCartOutlined style={{ fontSize: 24, color: '#3b82f6' }} />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="glass-card" style={{ padding: 20, borderLeft: '4px solid #06b6d4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>净利润</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                  {netProfit >= 0 ? '' : '-'}
                  <AnimatedNumber value={Math.abs(netProfit)} />
                </div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${netProfit >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarCircleOutlined style={{ fontSize: 24, color: netProfit >= 0 ? '#10b981' : '#ef4444' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={[
              {
                key: 'dashboard',
                label: <span><BarChartOutlined /> 数据概览</span>,
                children: (
                  <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    <div style={{ padding: 20, background: 'rgba(79, 70, 229, 0.05)', borderRadius: 12 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>资产负债率</div>
                      <div style={{ fontSize: 48, fontWeight: 700, color: '#4f46e5' }}>
                        {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : '0.0'}
                        <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-secondary)' }}>%</span>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        截止 {dayjs().format('YYYY-MM-DD')}
                      </div>
                    </div>

                    <div style={{ padding: 20, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>利润率</div>
                      <div style={{ fontSize: 48, fontWeight: 700, color: '#10b981' }}>
                        {totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0'}
                        <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-secondary)' }}>%</span>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        本期数据
                      </div>
                    </div>

                    <div style={{ padding: 20, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>库存总量</div>
                      <div style={{ fontSize: 48, fontWeight: 700, color: '#f59e0b' }}>
                        {inventoryReport.reduce((sum, item) => sum + item.quantity, 0)}
                        <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-secondary)' }}>件</span>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        涉及 {inventoryReport.length} 种物料
                      </div>
                    </div>

                    <div style={{ padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 12 }}>
                      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>订单统计</div>
                      <div style={{ display: 'flex', gap: 24 }}>
                        <div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#3b82f6' }}>{purchaseReport.length}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>采购订单</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 32, fontWeight: 700, color: '#06b6d4' }}>{saleReport.length}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>销售订单</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'balance',
                label: <span><PieChartOutlined /> 资产负债表</span>,
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>资产</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>
                            <AnimatedNumber value={totalAssets} />
                          </div>
                        </div>
                        <Table 
                          dataSource={balanceSheet?.assets.items} 
                          columns={balanceSheetColumns} 
                          pagination={false} 
                          rowKey="code"
                          bordered={false}
                          style={{ background: 'transparent' }}
                          onRow={(record) => ({
                            style: { cursor: 'pointer', transition: 'all 0.2s ease' },
                            onMouseEnter: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)';
                            },
                            onMouseLeave: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'transparent';
                            },
                          })}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>负债</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                            <AnimatedNumber value={totalLiabilities} />
                          </div>
                        </div>
                        <Table 
                          dataSource={balanceSheet?.liabilities.items} 
                          columns={balanceSheetColumns} 
                          pagination={false} 
                          rowKey="code"
                          bordered={false}
                          style={{ background: 'transparent' }}
                          onRow={(record) => ({
                            style: { cursor: 'pointer', transition: 'all 0.2s ease' },
                            onMouseEnter: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.03)';
                            },
                            onMouseLeave: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'transparent';
                            },
                          })}
                        />
                      </div>
                    </Col>
                    <Col span={8}>
                      <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>权益</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                            <AnimatedNumber value={totalEquity} />
                          </div>
                        </div>
                        <Table 
                          dataSource={balanceSheet?.equity.items} 
                          columns={balanceSheetColumns} 
                          pagination={false} 
                          rowKey="code"
                          bordered={false}
                          style={{ background: 'transparent' }}
                          onRow={(record) => ({
                            style: { cursor: 'pointer', transition: 'all 0.2s ease' },
                            onMouseEnter: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.03)';
                            },
                            onMouseLeave: (e: React.MouseEvent) => {
                              e.currentTarget.style.background = 'transparent';
                            },
                          })}
                        />
                      </div>
                    </Col>
                  </Row>
                ),
              },
              {
                key: 'income',
                label: <span><ArrowUpOutlined /> 利润表</span>,
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <div className="glass-card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>收入</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
                              <AnimatedNumber value={totalIncome} />
                            </div>
                          </div>
                          <Table 
                            dataSource={incomeStatement?.income.items} 
                            columns={incomeStatementColumns} 
                            pagination={false} 
                            rowKey="code"
                            bordered={false}
                            style={{ background: 'transparent' }}
                            onRow={(record) => ({
                              style: { cursor: 'pointer', transition: 'all 0.2s ease' },
                              onMouseEnter: (e: React.MouseEvent) => {
                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.03)';
                              },
                              onMouseLeave: (e: React.MouseEvent) => {
                                e.currentTarget.style.background = 'transparent';
                              },
                            })}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="glass-card" style={{ padding: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>费用</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>
                              <AnimatedNumber value={totalExpense} />
                            </div>
                          </div>
                          <Table 
                            dataSource={incomeStatement?.expense.items} 
                            columns={incomeStatementColumns} 
                            pagination={false} 
                            rowKey="code"
                            bordered={false}
                            style={{ background: 'transparent' }}
                            onRow={(record) => ({
                              style: { cursor: 'pointer', transition: 'all 0.2s ease' },
                              onMouseEnter: (e: React.MouseEvent) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.03)';
                              },
                              onMouseLeave: (e: React.MouseEvent) => {
                                e.currentTarget.style.background = 'transparent';
                              },
                            })}
                          />
                        </div>
                      </Col>
                    </Row>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card"
                      style={{ marginTop: 16, padding: 32, textAlign: 'center' }}
                    >
                      <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 12 }}>本期净利润</div>
                      <div style={{ fontSize: 48, fontWeight: 700, color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        {netProfit >= 0 ? '' : '-'}
                        <AnimatedNumber value={Math.abs(netProfit)} />
                      </div>
                      <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                        收入 {totalIncome.toFixed(2)} - 费用 {totalExpense.toFixed(2)} = {netProfit >= 0 ? '' : '-'}
                        {Math.abs(netProfit).toFixed(2)}
                      </div>
                    </motion.div>
                  </>
                ),
              },
              {
                key: 'inventory',
                label: <span><InboxOutlined /> 库存报表</span>,
                children: (
                  <Table 
                    dataSource={inventoryReport} 
                    columns={inventoryReportColumns} 
                    rowKey="id"
                    bordered={false}
                    style={{ background: 'transparent' }}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
                    onRow={(record) => ({
                      style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                      onMouseEnter: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      },
                      onMouseLeave: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      },
                    })}
                  />
                ),
              },
              {
                key: 'purchase',
                label: <span><ShoppingCartOutlined /> 采购报表</span>,
                children: (
                  <Table 
                    dataSource={purchaseReport} 
                    columns={purchaseReportColumns} 
                    rowKey="id"
                    bordered={false}
                    style={{ background: 'transparent' }}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
                    onRow={(record) => ({
                      style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                      onMouseEnter: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      },
                      onMouseLeave: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      },
                    })}
                  />
                ),
              },
              {
                key: 'sale',
                label: <span><DollarCircleOutlined /> 销售报表</span>,
                children: (
                  <Table 
                    dataSource={saleReport} 
                    columns={saleReportColumns} 
                    rowKey="id"
                    bordered={false}
                    style={{ background: 'transparent' }}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条记录` }}
                    onRow={(record) => ({
                      style: { cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: 8 },
                      onMouseEnter: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      },
                      onMouseLeave: (e: React.MouseEvent) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      },
                    })}
                  />
                ),
              },
            ]}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default ReportPage;