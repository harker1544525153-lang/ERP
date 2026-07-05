import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, InputNumber, Input, Row, Col, message, Tag, Tabs } from 'antd';
import { PlusOutlined, CheckOutlined, SendOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, ShoppingOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getSaleOrders, createSaleOrder, approveSaleOrder, shipSaleOrder, deleteSaleOrder } from '@/api/sale';
import { getCustomers } from '@/api/customer';
import { getWarehouses } from '@/api/warehouse';
import { getMaterials } from '@/api/material';
import { getUserFromStorage } from '@/utils/storage';
import dayjs from 'dayjs';
type Customer = { id: string; name: string };
type Warehouse = { id: string; name: string };
type Material = { id: string; code: string; name: string; spec: string; unit: string; price: number };
type SaleOrderItem = { id: string; materialId: string; material?: Material; quantity: number; unitPrice: number; shippedQty: number };
type SaleOrder = { id: string; number: string; date: string; customerId: string; warehouseId: string; totalAmount: number; status: string; creatorId: string; approverId: string | null; tenantId: string; customer?: Customer; warehouse?: Warehouse; creator?: { realName: string }; items: SaleOrderItem[] };

function SalePage() {
  const [data, setData] = useState<SaleOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);
  const [form] = Form.useForm();
  const [shipForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getSaleOrders(user.tenantId).then(res => setData(res.data));
      getCustomers(user.tenantId).then(res => setCustomers(res.data));
      getWarehouses(user.tenantId).then(res => setWarehouses(res.data));
      getMaterials(user.tenantId).then(res => setMaterials(res.data));
    }
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      items: [{ quantity: 1, unitPrice: 0 }],
      date: dayjs(),
    });
    setModalVisible(true);
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: '确认审核',
      content: '确定要审核此销售订单吗？',
      okText: '确认审核',
      cancelText: '取消',
      onOk: () => {
        const user = getUserFromStorage();
        approveSaleOrder(id, { approverId: user.id }).then((response) => {
          message.success(response.message || '审核成功');
          getSaleOrders(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '审核失败');
        });
      },
    });
  };

  const handleShip = (order: SaleOrder) => {
    setSelectedOrder(order);
    shipForm.setFieldsValue({
      items: order.items.map(item => ({
        itemId: item.id,
        quantity: item.quantity - item.shippedQty,
      })),
    });
    setShipModalVisible(true);
  };

  const handleSubmitShip = () => {
    shipForm.validateFields().then(values => {
      if (!selectedOrder) return;
      const user = getUserFromStorage();
      shipSaleOrder(selectedOrder.id, values).then((response) => {
        message.success(response.message || '出库成功');
        setShipModalVisible(false);
        getSaleOrders(user.tenantId).then(res => setData(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '出库失败');
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
        deleteSaleOrder(id).then((response) => {
          message.success(response.message || '删除成功');
          getSaleOrders(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '删除失败');
        });
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const data = { ...values, tenantId: user.tenantId, creatorId: user.id };
      
      createSaleOrder(data).then((response) => {
        message.success(response.message || '创建成功');
        setModalVisible(false);
        getSaleOrders(user.tenantId).then(res => setData(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '创建失败');
      });
    });
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    draft: { color: 'default', label: '草稿' },
    approved: { color: 'processing', label: '已审核' },
    completed: { color: 'success', label: '已完成' },
  };

  const filteredData = data.filter(item => 
    (item.code && item.code.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.customer?.name && item.customer.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.warehouse?.name && item.warehouse.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: '订单编号', dataIndex: 'code', key: 'code', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '客户', dataIndex: ['customer', 'name'], key: 'customer' },
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { 
      title: '金额', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      width: 120,
      render: (v: number) => <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>¥{v.toFixed(2)}</span>,
    },
    { title: '制单人', dataIndex: ['creator', 'realName'], key: 'creator', width: 80 },
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
      width: 180,
      render: (_: unknown, record: SaleOrder) => (
        <span>
          {record.status === 'draft' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                border: 'none',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                padding: '4px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                marginRight: 6,
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              onClick={() => handleApprove(record.id)}
            >
              <CheckOutlined style={{ fontSize: 14 }} />
              审核
            </motion.button>
          )}
          {record.status === 'approved' && (
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
              onClick={() => handleShip(record)}
            >
              <SendOutlined style={{ fontSize: 14 }} />
              出库
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
  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));
  const materialOptions = materials.map(m => ({ value: m.id, label: `${m.code} - ${m.name}` }));

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <ShoppingOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">销售管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索订单编号、客户、仓库..."
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
          新增销售订单
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="销售订单" key="list">
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
          title="新增销售订单"
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={800}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="date" label="订单日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
                <Select options={customerOptions} style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="warehouseId" label="出库仓库" rules={[{ required: true }]}>
                <Select options={warehouseOptions} style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map((field, index) => (
                    <Row key={field.key} style={{ marginBottom: 12, padding: 12, background: 'rgba(79, 70, 229, 0.03)', borderRadius: 8 }} gutter={12}>
                      <Col span={10}>
                        <Form.Item {...field} name={[field.name, 'materialId']} label={`明细${index + 1}-物料`} rules={[{ required: true }]}>
                          <Select options={materialOptions} placeholder="选择物料" style={{ borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="数量" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%', borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'unitPrice']} label="单价" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%', borderRadius: 8 }} prefix="¥" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ marginTop: 24 }}>
                        {fields.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => remove(field.name)}
                            style={{
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              padding: '4px',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            <DeleteOutlined />
                          </motion.button>
                        )}
                      </Col>
                    </Row>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => add({ quantity: 1, unitPrice: 0 })}
                    style={{
                      border: '1px dashed var(--border-color)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      padding: '10px 20px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <PlusOutlined />
                    添加明细
                  </motion.button>
                </div>
              )}
            </Form.List>
          </Form>
        </Modal>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={shipModalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title="销售出库"
          visible={shipModalVisible}
          onOk={handleSubmitShip}
          onCancel={() => setShipModalVisible(false)}
          width={600}
        >
          <Form form={shipForm} layout="vertical">
            <Form.List name="items">
              {(fields) => (
                <div>
                  {fields.map((field, index) => (
                    <Row key={field.key} style={{ marginBottom: 12, padding: 12, background: 'rgba(59, 130, 246, 0.03)', borderRadius: 8 }} gutter={12}>
                      <Col span={12}>
                        <div style={{ paddingTop: 8 }}>
                          <span style={{ fontWeight: 500 }}>物料: </span>
                          <span>{selectedOrder?.items[index]?.material?.name}</span>
                          <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                            规格: {selectedOrder?.items[index]?.material?.spec}
                          </span>
                        </div>
                      </Col>
                      <Col span={8}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="出库数量" rules={[{ required: true }]}>
                          <InputNumber 
                            style={{ width: '100%', borderRadius: 8 }} 
                            max={selectedOrder?.items[index]?.quantity}
                            placeholder="请输入出库数量"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4} style={{ paddingTop: 24, textAlign: 'right' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          已出库: {selectedOrder?.items[index]?.shippedQty || 0}
                        </span>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
            </Form.List>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
}

export default SalePage;
