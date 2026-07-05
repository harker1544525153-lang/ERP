import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber, Row, Col, message, Tag, Tabs } from 'antd';
import { PlusOutlined, CheckOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getVouchers, createVoucher, approveVoucher, deleteVoucher } from '@/api/voucher';
import { getAccountTree } from '@/api/account';
import { getUserFromStorage } from '@/utils/storage';
import { exportToCSV } from '@/utils/export';
import dayjs from 'dayjs';
type Voucher = { id: string; number: string; date: string; type: string; summary: string; status: string; creatorId: string; approverId: string | null; tenantId: string; creator?: { realName: string }; approver?: { realName: string } };
type VoucherEntry = { accountId: string; debit: number; credit: number; summary: string };

function VoucherPage() {
  const [data, setData] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getVouchers(user.tenantId).then(res => setData(res.data));
      getAccountTree(user.tenantId).then(res => setAccounts(res.data));
    }
  }, []);

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      entries: [{ debit: 0, credit: 0 }],
      date: dayjs(),
    });
    setModalVisible(true);
  };

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: '确认审核',
      content: '确定要审核此凭证吗？',
      okText: '确认审核',
      cancelText: '取消',
      onOk: () => {
        const user = getUserFromStorage();
        approveVoucher(id, { approverId: user.id }).then(() => {
          message.success('审核成功');
          getVouchers(user.tenantId).then(res => setData(res.data));
        });
      },
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
        deleteVoucher(id).then(() => {
          message.success('删除成功');
          getVouchers(user.tenantId).then(res => setData(res.data));
        });
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const data = { ...values, tenantId: user.tenantId, creatorId: user.id };
      
      createVoucher(data).then(() => {
        message.success('创建成功');
        setModalVisible(false);
        getVouchers(user.tenantId).then(res => setData(res.data));
      });
    });
  };

  const statusMap: Record<string, { color: string; label: string }> = {
    draft: { color: 'default', label: '草稿' },
    approved: { color: 'success', label: '已审核' },
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'number', title: '凭证编号' },
      { key: 'date', title: '日期', render: (date) => dayjs(date).format('YYYY-MM-DD') },
      { key: 'type', title: '类型', render: (type) => ({ purchase: '采购', sale: '销售', general: '通用凭证' }[type] || type) },
      { key: 'summary', title: '摘要' },
      { key: 'creatorId', title: '制单人', render: (_, record) => record.creator?.realName || '-' },
      { key: 'approverId', title: '审核人', render: (_, record) => record.approver?.realName || '-' },
      { key: 'status', title: '状态', render: (status) => statusMap[status]?.label || status },
    ];
    exportToCSV(filteredData, exportColumns, '凭证列表');
    message.success('导出成功');
  };

  const filteredData = data.filter(item => 
    item.number.toLowerCase().includes(searchText.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchText.toLowerCase()) ||
    (item.creator?.realName && item.creator.realName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    { title: '凭证编号', dataIndex: 'number', key: 'number', width: 140 },
    { title: '日期', dataIndex: 'date', key: 'date', width: 100, render: (d: string) => dayjs(d).format('YYYY-MM-DD') },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80 },
    { title: '摘要', dataIndex: 'summary', key: 'summary' },
    { title: '制单人', dataIndex: ['creator', 'realName'], key: 'creator', width: 80 },
    { title: '审核人', dataIndex: ['approver', 'realName'], key: 'approver', width: 80 },
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
      render: (_: unknown, record: Voucher) => (
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

  const accountOptions = accounts.map(acc => ({ value: acc.id, label: `${acc.code} - ${acc.name}` }));

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <FileTextOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">凭证管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索凭证编号、摘要、制单人..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ borderRadius: 8 }}>导出</Button>
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
          新增凭证
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="凭证列表" key="list">
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
          title="新增凭证"
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={800}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="date" label="凭证日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%', borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="type" label="凭证类型" rules={[{ required: true }]}>
                <Select options={[{ value: 'general', label: '通用凭证' }]} style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.Item name="summary" label="摘要">
              <Input placeholder="请输入凭证摘要" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.List name="entries">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map((field, index) => (
                    <Row key={field.key} style={{ marginBottom: 12, padding: 12, background: 'rgba(79, 70, 229, 0.03)', borderRadius: 8 }} gutter={8}>
                      <Col span={8}>
                        <Form.Item {...field} name={[field.name, 'accountId']} label={`分录${index + 1}-科目`} rules={[{ required: true }]}>
                          <Select options={accountOptions} placeholder="选择科目" style={{ borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item {...field} name={[field.name, 'debit']} label="借方">
                          <InputNumber style={{ width: '100%', borderRadius: 8 }} prefix="¥" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item {...field} name={[field.name, 'credit']} label="贷方">
                          <InputNumber style={{ width: '100%', borderRadius: 8 }} prefix="¥" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item {...field} name={[field.name, 'summary']} label="摘要">
                          <Input placeholder="摘要" style={{ borderRadius: 8 }} />
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
                    onClick={() => add({ debit: 0, credit: 0 })}
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
                    添加分录
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

export default VoucherPage;
