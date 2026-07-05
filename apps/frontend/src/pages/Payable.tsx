import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, InputNumber, Input, message, Tag, Tabs } from 'antd';
import { PlusOutlined, CreditCardOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getPayables, createPayable, makePayment, deletePayable, getPayableSummary } from '@/api/payable';
import { getSuppliers } from '@/api/supplier';
import { getPurchaseOrders } from '@/api/purchase';
import { getUserFromStorage } from '@/utils/storage';
import dayjs from 'dayjs';
type Supplier = { id: string; name: string };
type PurchaseOrder = { id: string; number: string };
type Payable = { id: string; supplierId: string; purchaseOrderId: string; date: string; amount: number; paidAmount: number; status: string; tenantId: string; supplier?: Supplier; purchaseOrder?: PurchaseOrder };
type PayableSummary = { total: number; pending: number; partial: number; paid: number };

function PayablePage() {
  const [data, setData] = useState<Payable[]>([]);
  const [summary, setSummary] = useState<PayableSummary | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [form] = Form.useForm();
  const [payForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getPayables(user.tenantId).then(res => setData(res.data));
      getPayableSummary(user.tenantId).then(res => setSummary(res.data));
      getSuppliers(user.tenantId).then(res => setSuppliers(res.data));
      getPurchaseOrders(user.tenantId).then(res => setPurchaseOrders(res.data));
    }
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalVisible(true);
  };

  const handlePay = (payable: Payable) => {
    setSelectedPayable(payable);
    payForm.setFieldsValue({ amount: payable.amount - payable.paidAmount });
    setPayModalVisible(true);
  };

  const handleSubmitPay = () => {
    payForm.validateFields().then(values => {
      if (!selectedPayable) return;
      const user = getUserFromStorage();
      makePayment(selectedPayable.id, values).then((response) => {
        message.success(response.message || '付款成功');
        setPayModalVisible(false);
        getPayables(user.tenantId).then(res => setData(res.data));
        getPayableSummary(user.tenantId).then(res => setSummary(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '付款失败');
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
        deletePayable(id).then((response) => {
          message.success(response.message || '删除成功');
          getPayables(user.tenantId).then(res => setData(res.data));
          getPayableSummary(user.tenantId).then(res => setSummary(res.data));
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
      
      createPayable(data).then((response) => {
        message.success(response.message || '创建成功');
        setModalVisible(false);
        getPayables(user.tenantId).then(res => setData(res.data));
        getPayableSummary(user.tenantId).then(res => setSummary(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '创建失败');
      });
    });
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    pending: { color: 'processing', label: '待付款' },
    partial: { color: 'warning', label: '部分付款' },
    paid: { color: 'success', label: '已结清' },
  };

  const filteredData = data.filter(item => 
    (item.supplier?.name && item.supplier.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.purchaseOrder?.number && item.purchaseOrder.number.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: '供应商', dataIndex: ['supplier', 'name'], key: 'supplier' },
    { title: '采购订单', dataIndex: ['purchaseOrder', 'number'], key: 'purchaseOrder', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { 
      title: '应付金额', 
      dataIndex: 'amount', 
      key: 'amount', 
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>¥{v.toFixed(2)}</span>,
    },
    { title: '已付金额', dataIndex: 'paidAmount', key: 'paidAmount', width: 100, render: (v: number) => `¥${v.toFixed(2)}` },
    { 
      title: '待付金额', 
      key: 'pending', 
      width: 100,
      render: (_: unknown, record: Payable) => (
        <span style={{ fontWeight: 500, color: '#ef4444' }}>¥{(record.amount - record.paidAmount).toFixed(2)}</span>
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
      render: (_: unknown, record: Payable) => (
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
              onClick={() => handlePay(record)}
            >
              <CreditCardOutlined style={{ fontSize: 14 }} />
              付款
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

  const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }));
  const purchaseOrderOptions = purchaseOrders.map(p => ({ value: p.id, label: p.number }));

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <CreditCardOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">应付管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索供应商、订单编号..."
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
          新增应付款
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
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>应付总额</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>¥{(summary?.total || 0).toFixed(2)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>待付款</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>¥{(summary?.pending || 0).toFixed(2)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>部分付款</div>
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
            <Tabs.TabPane tab="应付列表" key="list">
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
          title="新增应付款"
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={500}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="supplierId" label="供应商" rules={[{ required: true, message: '请选择供应商' }]}>
              <Select options={supplierOptions} style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="purchaseOrderId" label="采购订单">
              <Select options={purchaseOrderOptions} allowClear style={{ borderRadius: 8 }} />
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
        animate={payModalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title="付款"
          visible={payModalVisible}
          onOk={handleSubmitPay}
          onCancel={() => setPayModalVisible(false)}
          width={400}
        >
          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(79, 70, 229, 0.05)', borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>供应商: </span>
              <span>{selectedPayable?.supplier?.name}</span>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)' }}>应付金额: </span>
              <span style={{ fontWeight: 500 }}>¥{(selectedPayable?.amount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>已付金额: </span>
              <span>¥{(selectedPayable?.paidAmount || 0).toFixed(2)}</span>
            </div>
          </div>
          <Form form={payForm} layout="vertical">
            <Form.Item name="amount" label="付款金额" rules={[{ required: true, message: '请输入付款金额' }]}>
              <InputNumber 
                style={{ width: '100%', borderRadius: 8 }} 
                max={selectedPayable?.amount - selectedPayable?.paidAmount}
                prefix="¥"
              />
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
}

export default PayablePage;
