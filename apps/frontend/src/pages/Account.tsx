import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, TreeSelect, message, Tabs } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BookOutlined } from '@ant-design/icons';
import { getAccounts, getAccountTree, createAccount, updateAccount, deleteAccount, getAccountBalance } from '@/api/account';
import { getUserFromStorage } from '@/utils/storage';

type Account = { id: string; code: string; name: string; category: string; type: string; level: number; parentId: string | null; tenantId: string; parent?: { name: string }; children?: Account[] };

function AccountPage() {
  const [data, setData] = useState<Account[]>([]);
  const [treeData, setTreeData] = useState<Account[]>([]);
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('list');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getAccounts(user.tenantId).then(res => setData(res.data));
      getAccountTree(user.tenantId).then(res => setTreeData(res.data));
      getAccountBalance(user.tenantId).then(res => setBalanceData(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Account) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除吗？',
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        deleteAccount(id).then(() => {
          message.success('删除成功');
          const user = getUserFromStorage();
          getAccounts(user.tenantId).then(res => setData(res.data));
          getAccountBalance(user.tenantId).then(res => setBalanceData(res.data));
        });
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const data = { ...values, tenantId: user.tenantId };
      
      if (editingId) {
        updateAccount(editingId, data).then(() => {
          message.success('更新成功');
          setModalVisible(false);
          getAccounts(user.tenantId).then(res => setData(res.data));
          getAccountBalance(user.tenantId).then(res => setBalanceData(res.data));
        });
      } else {
        createAccount(data).then(() => {
          message.success('创建成功');
          setModalVisible(false);
          getAccounts(user.tenantId).then(res => setData(res.data));
          getAccountBalance(user.tenantId).then(res => setBalanceData(res.data));
        });
      }
    });
  };

  const filteredData = data.filter(item => 
    item.code.includes(searchText) || 
    item.name.includes(searchText)
  );

  const columns = [
    { title: '科目编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '科目名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '类别', dataIndex: 'category', key: 'category', width: 80 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '级别', dataIndex: 'level', key: 'level', width: 60 },
    { title: '上级科目', dataIndex: ['parent', 'name'], key: 'parent', width: 150 },
    { 
      title: '操作', 
      key: 'action',
      width: 120,
      render: (_: unknown, record: Account) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ borderRadius: 8 }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} style={{ borderRadius: 8 }} />
        </div>
      ),
    },
  ];

  const balanceColumns = [
    { title: '科目编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '科目名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '借方', dataIndex: 'debit', key: 'debit', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '贷方', dataIndex: 'credit', key: 'credit', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '余额', dataIndex: 'balance', key: 'balance', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
  ];

  const treeSelectData = treeData.map(item => ({
    title: `${item.code} - ${item.name}`,
    value: item.id,
    children: item.children?.map(c => ({ title: `${c.code} - ${c.name}`, value: c.id })),
  }));

  const categoryOptions = [
    { value: 'asset', label: '资产' },
    { value: 'liability', label: '负债' },
    { value: 'equity', label: '权益' },
    { value: 'income', label: '收入' },
    { value: 'expense', label: '费用' },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <BookOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">会计科目管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        {activeTab === 'list' && (
          <>
            <Input
              placeholder="搜索科目编码、名称..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300, borderRadius: 8 }}
            />
            <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd} style={{ borderRadius: 8 }}>
              新增科目
            </Button>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 20 }}>
            <Tabs.TabPane tab="科目列表" key="list">
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
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="余额表" key="balance">
              <Table 
                dataSource={balanceData} 
                columns={balanceColumns} 
                rowKey="id"
                bordered={false}
                style={{ background: 'transparent' }}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                }}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </motion.div>

      <Modal
        title={editingId ? '编辑科目' : '新增科目'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="科目编码" rules={[{ required: true, message: '请输入科目编码' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="name" label="科目名称" rules={[{ required: true, message: '请输入科目名称' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="category" label="科目类别" rules={[{ required: true, message: '请选择科目类别' }]}>
            <Select options={categoryOptions} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="type" label="科目类型">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="level" label="级别" rules={[{ required: true, message: '请输入级别' }]}>
            <Input type="number" style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="parentId" label="上级科目">
            <TreeSelect treeData={treeSelectData} placeholder="选择上级科目" allowClear style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AccountPage;
