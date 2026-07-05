import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, InputNumber, Input, message, Tag, Tabs } from 'antd';
import { PlusOutlined, DollarCircleOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getReceivables, createReceivable, receivePayment, deleteReceivable, getReceivableSummary } from '@/api/receivable';
import { getCustomers } from '@/api/customer';
import { getSaleOrders } from '@/api/sale';
import { getUserFromStorage } from '@/utils/storage';
import dayjs from 'dayjs';
type Customer = { id: string; name: string };
type SaleOrder = { id: string; number: string };
type Receivable = { id: string; customerId: string; saleOrderId: string; date: string; amount: number; receivedAmount: number; status: string; tenantId: string; customer?: Customer; saleOrder?: SaleOrder };
type ReceivableSummary = { total: number; pending: number; partial: number; paid: number };

function ReceivablePage() {
  const [data, setData] = useState<Receivable[]>([]);
  const [summary, setSummary] = useState<ReceivableSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saleOrders, setSaleOrders] = useState<SaleOrder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [form] = Form.useForm();
  const [receiveForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getReceivables(user.tenantId).then(res => setData(res.data));
      getReceivableSummary(user.tenantId).then(res => setSummary(res.data));
      getCustomers(user.tenantId).then(res => setCustomers(res.data));
      getSaleOrders(user.tenantId).then(res => setSaleOrders(res.data));
    }
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalVisible(true);
  };

  const handleReceive = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    receiveForm.setFieldsValue({ amount: receivable.amount - receivable.receivedAmount });
    setReceiveModalVisible(true);
  };

  const handleSubmitReceive = () => {
    receiveForm.validateFields().then(values => {
      if (!selectedReceivable) return;
      const user = getUserFromStorage();
      receivePayment(selectedReceivable.id, values).then((response) => {
        message.success(response.message || '收款成功');
        setReceiveModalVisible(false);
        getReceivables(user.tenantId).then(res => setData(res.data));
        getReceivableSummary(user.tenantId).then(res => setSummary(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '收款失败');
      });
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => {
        const user = getUserFromStorage();
        deleteReceivable(id).then((response) => {
          message.success(response.message || '删除成功');
          getReceivables(user.tenantId).then(res => setData(res.data));
          getReceivableSummary(user.tenantId).then(res => setSummary(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '删除失败');
        });
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const data = { ...values, tenantId: user.tenantId };
      
      createReceivable(data).then((response) => {
        message.success(response.message || '创建成功');
        setModalVisible(false);
        getReceivables(user.tenantId).then(res => setData(res.data));
        getReceivableSummary(user.tenantId).then(res => setSummary(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '创建失败');
      });
    });
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: 'processing', label: '待收款' },
    partial: { color: 'warning', label: '部分收款' },
    paid: { color: 'success', label: '已结清' },
  };

  const filteredData = data.filter(item => 
    (item.customer?.name && item.customer.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.saleOrder?.number && item.saleOrder.number.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: '销售订单', dataIndex: ['saleOrder', 'number'], key: 'saleOrder', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { 
      title: '应收金额', 
      dataIndex: 'amount', 
      key: 'amount', 
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>¥{v.toFixed(2)}</span>,
    },
    { title: '已收金额', dataIndex: 'receivedAmount', key: 'receivedAmount', width: 100, render: (v: number) => `¥${v.toFixed(2)}` },
    { 
      title: '待收金额', 
      key: 'pending', 
      width: 100,
      render: (_: unknown, record: Receivable) => (
        <span style={{ fontWeight: 500, color: '#ef4444' }}>¥{(record.amount - record.receivedAmount).toFixed(2)}</span>
      ),
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 80,
      render: (s: string) => (
        <Tag color={statusMap[s]?.color} style={{ borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
          {statusMap[s]?.label}
        </Tag>
      ),
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 140,
      render: (_: unknown, record: Receivable) => (
        <span>
          {record.status !== 'paid' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                border: 'none',
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                marginRight: 6,
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={() => handleReceive(record)}
            >
              <DollarCircleOutlined style={{ fontSize: 14 }} />
              收款
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              border: 'none',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '4px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() => handleDelete(record.id)}
          >
            <DeleteOutlined style={{ fontSize: 14 }} />
            删除
          </motion.button>
        </span>
      ),
    },
  ];

  const customerOptions = customers.map(c => ({ value: c.id, label: c.name }));
  const saleOrderOptions = saleOrders.map(s => ({ value: s.id, label: s.number }));

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <DollarCircleOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">应收管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索客户、订单编号..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>导出</Button>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          <PlusOutlined />
          新增应收款
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-grid"
        style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>应收总额</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>¥{(summary?.total || 0).toFixed(2)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>待收款</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>¥{(summary?.pending || 0).toFixed(2)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>部分收款</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>¥{(summary?.partial || 0).toFixed(2)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>已结清</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>¥{(summary?.paid || 0).toFixed(2)}</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="应收列表" key="list">
              <Table 
                dataSource={filteredData} 
                columns={columns} 
                rowKey="id"
                bordered={false}
                style={{ background: 'transparent' }}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                onRow={(record) => ({
                  style: { 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease',
                    borderRadius: 8,
                  },
                  onMouseEnter: (e) => {
                    e.currentTarget.style.background = 'rgba(79, 70, 229, 0.03)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  },
                  onMouseLeave: (e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  },
                })}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={modalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title="新增应收款"
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={500}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
              <Select options={customerOptions} style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="saleOrderId" label="销售订单">
              <Select options={saleOrderOptions} allowClear style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="date" label="日期" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%', borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="amount" label="金额" rules={[{ required: true, message: '请输入金额' }]}>
              <InputNumber style={{ width: '100%', borderRadius: 8 }} prefix="¥" />
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={receiveModalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title="收款"
          visible={receiveModalVisible}
          onOk={handleSubmitReceive}
          onCancel={() => setReceiveModalVisible(false)}
          width={400}
        >
          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(79, 70, 229, 0.05)', borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>客户: </span>
              <span>{selectedReceivable?.customer?.name}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>应收金额: </span>
              <span style={{ fontWeight: 500 }}>¥{(selectedReceivable?.amount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>已收金额: </span>
              <span>¥{(selectedReceivable?.receivedAmount || 0).toFixed(2)}</span>
            </div>
          </div>
          <Form form={receiveForm} layout="vertical">
            <Form.Item name="amount" label="收款金额" rules={[{ required: true, message: '请输入收款金额' }]}>
              <InputNumber 
                style={{ width: '100%', borderRadius: 8 }} 
                max={selectedReceivable?.amount - selectedReceivable?.receivedAmount}
                prefix="¥"
              />
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
}

export default ReceivablePage;
