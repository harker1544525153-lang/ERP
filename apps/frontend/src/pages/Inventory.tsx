import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, DatePicker, Select, InputNumber, Input, Row, Col, message, Tag, Tabs } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getInventories, getTransfers, createTransfer, approveTransfer, deleteTransfer } from '@/api/inventory';
import { getWarehouses } from '@/api/warehouse';
import { getMaterials } from '@/api/material';
import { getUserFromStorage } from '@/utils/storage';
import dayjs from 'dayjs';
type Warehouse = { id: string; name: string };
type Material = { id: string; code: string; name: string; spec: string; unit: string; price: number };
type Inventory = { id: string; warehouseId: string; materialId: string; quantity: number; tenantId: string; warehouse?: Warehouse; material?: Material };
type InventoryTransfer = { id: string; number: string; date: string; fromWarehouseId: string; toWarehouseId: string; status: string; creatorId: string; approverId: string | null; tenantId: string; fromWarehouse?: Warehouse; toWarehouse?: Warehouse; creator?: { realName: string } };

function InventoryPage() {
  const [data, setData] = useState<Inventory[]>([]);
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getInventories(user.tenantId).then(res => setData(res.data));
      getTransfers(user.tenantId).then(res => setTransfers(res.data));
      getWarehouses(user.tenantId).then(res => setWarehouses(res.data));
      getMaterials(user.tenantId).then(res => setMaterials(res.data));
    }
  }, []);

  const handleAddTransfer = () => {
    form.resetFields();
    form.setFieldsValue({
      items: [{ quantity: 1 }],
      date: dayjs(),
    });
    setModalVisible(true);
  };

  const handleApproveTransfer = (id: string) => {
    Modal.confirm({
      title: '确认审核',
      content: '确定要审核此调拨单吗？',
      okText: '确认审核',
      cancelText: '取消',
      onOk: () => {
        const user = getUserFromStorage();
        approveTransfer(id).then((response) => {
          message.success(response.message || '审核成功');
          getTransfers(user.tenantId).then(res => setTransfers(res.data));
          getInventories(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '审核失败');
        });
      },
    });
  };

  const handleDeleteTransfer = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      okText: '确认删除',
      cancelText: '取消',
      onOk: () => {
        const user = getUserFromStorage();
        deleteTransfer(id).then((response) => {
          message.success(response.message || '删除成功');
          getTransfers(user.tenantId).then(res => setTransfers(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '删除失败');
        });
      },
    });
  };

  const handleSubmitTransfer = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const data = { ...values, tenantId: user.tenantId, creatorId: user.id };
      
      createTransfer(data).then((response) => {
        message.success(response.message || '创建成功');
        setModalVisible(false);
        getTransfers(user.tenantId).then(res => setTransfers(res.data));
      }).catch((error: any) => {
        message.error(error.response?.data?.message || '创建失败');
      });
    });
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    draft: { color: 'default', label: '草稿' },
    approved: { color: 'success', label: '已审核' },
  };

  const filteredInventoryData = data.filter(item => 
    (item.warehouse?.name && item.warehouse.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.material?.name && item.material.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.material?.code && item.material.code.toLowerCase().includes(searchText.toLowerCase()))
  );

  const filteredTransferData = transfers.filter(item => 
    (item.code && item.code.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.fromWarehouse?.name && item.fromWarehouse.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (item.toWarehouse?.name && item.toWarehouse.name.toLowerCase().includes(searchText.toLowerCase()))
  );

  const totalAmount = data.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.material?.price || 0)), 0);
  const totalQuantity = data.reduce((sum, item) => sum + Number(item.quantity), 0);

  const inventoryColumns = [
    { title: '仓库', dataIndex: ['warehouse', 'name'], key: 'warehouse' },
    { title: '物料', dataIndex: ['material', 'name'], key: 'material' },
    { title: '规格', dataIndex: ['material', 'spec'], key: 'spec' },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (v: number) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    { title: '单位', dataIndex: ['material', 'unit'], key: 'unit', width: 60 },
    { 
      title: '参考价', 
      dataIndex: ['material', 'price'], 
      key: 'price', 
      width: 100,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    { 
      title: '金额', 
      key: 'amount', 
      width: 120,
      render: (_: unknown, record: Inventory) => (
        <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>
          ¥{(Number(record.quantity) * Number(record.material?.price || 0)).toFixed(2)}
        </span>
      ),
    },
  ];

  const transferColumns = [
    { title: '调拨单号', dataIndex: 'code', key: 'code', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '调出仓库', dataIndex: ['fromWarehouse', 'name'], key: 'fromWarehouse' },
    { title: '调入仓库', dataIndex: ['toWarehouse', 'name'], key: 'toWarehouse' },
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
      width: 140,
      render: (_: unknown, record: InventoryTransfer) => (
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
              onClick={() => handleApproveTransfer(record.id)}
            >
              <CheckOutlined style={{ fontSize: 14 }} />
              审核
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
            onClick={() => handleDeleteTransfer(record.id)}
          >
            <DeleteOutlined style={{ fontSize: 14 }} />
            删除
          </motion.button>
        </span>
      ),
    },
  ];

  const warehouseOptions = warehouses.map(w => ({ value: w.id, label: w.name }));
  const materialOptions = materials.map(m => ({ value: m.id, label: `${m.code} - ${m.name}` }));

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <InboxOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">库存管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索仓库、物料名称、编码..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button icon={<DownloadOutlined />} style={{ borderRadius: 8 }}>导出</Button>
        </div>
        {activeTab === 'transfer' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTransfer}
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
            新增调拨单
          </motion.button>
        )}
      </motion.div>

      {activeTab === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-grid"
          style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        >
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>库存总量</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{totalQuantity}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>件</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>库存总金额</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#4f46e5' }}>¥{totalAmount.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>元</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>物料种类</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Set(data.map(item => item.materialId)).size}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>种</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>仓库数量</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
              {new Set(data.map(item => item.warehouseId)).size}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>个</div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="库存查询" key="list">
              <Table 
                dataSource={filteredInventoryData} 
                columns={inventoryColumns} 
                rowKey="id"
                bordered={false}
                style={{ background: 'transparent' }}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                onRow={() => ({
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
            <Tabs.TabPane tab="库存调拨" key="transfer">
              <Table 
                dataSource={filteredTransferData} 
                columns={transferColumns} 
                rowKey="id"
                bordered={false}
                style={{ background: 'transparent' }}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
                onRow={() => ({
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
          title="新增调拨单"
          visible={modalVisible}
          onOk={handleSubmitTransfer}
          onCancel={() => setModalVisible(false)}
          width={700}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="date" label="调拨日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="fromWarehouseId" label="调出仓库" rules={[{ required: true }]}>
                <Select options={warehouseOptions} style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="toWarehouseId" label="调入仓库" rules={[{ required: true }]}>
                <Select options={warehouseOptions} style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map((field, index) => (
                    <Row key={field.key} style={{ marginBottom: 12, padding: 12, background: 'rgba(79, 70, 229, 0.03)', borderRadius: 8 }} gutter={12}>
                      <Col span={14}>
                        <Form.Item {...field} name={[field.name, 'materialId']} label={`明细${index + 1}-物料`} rules={[{ required: true }]}>
                          <Select options={materialOptions} placeholder="选择物料" style={{ borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="数量" rules={[{ required: true }]}>
                          <InputNumber style={{ width: '100%', borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col span={4} style={{ marginTop: 24 }}>
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
                    onClick={() => add({ quantity: 1 })}
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
    </div>
  );
}

export default InventoryPage;
