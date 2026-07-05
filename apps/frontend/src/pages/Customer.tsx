import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customer';
import { getUserFromStorage } from '@/utils/storage';
type Customer = { id: string; code: string; name: string; shortName: string; contact: string; phone: string; address: string; taxCode: string; tenantId: string };

function CustomerPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getCustomers(user.tenantId).then(res => setData(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Customer) => {
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
      onOk: () => {
        deleteCustomer(id).then((response) => {
          message.success(response.message || '删除成功');
          const user = getUserFromStorage();
          getCustomers(user.tenantId).then(res => setData(res.data));
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
      
      if (editingId) {
        updateCustomer(editingId, data).then((response) => {
          message.success(response.message || '更新成功');
          setModalVisible(false);
          getCustomers(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '更新失败');
        });
      } else {
        createCustomer(data).then((response) => {
          message.success(response.message || '创建成功');
          setModalVisible(false);
          getCustomers(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '创建失败');
        });
      }
    });
  };

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.contact.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: '客户编码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '简称', dataIndex: 'shortName', key: 'shortName', width: 80 },
    { title: '联系人', dataIndex: 'contact', key: 'contact', width: 100 },
    { title: '电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: '税号', dataIndex: 'taxCode', key: 'taxCode', width: 140 },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      render: (_: unknown, record: Customer) => (
        <span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              border: 'none',
              background: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              padding: '4px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              marginRight: 8,
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleEdit(record)}
          >
            <EditOutlined style={{ fontSize: 14 }} />
          </motion.button>
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
            }}
            onClick={() => handleDelete(record.id)}
          >
            <DeleteOutlined style={{ fontSize: 14 }} />
          </motion.button>
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <CustomerServiceOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">客户管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索客户编码、名称、联系人..."
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
          新增客户
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass-card" style={{ padding: 24 }}>
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
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={modalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title={editingId ? '编辑客户' : '新增客户'}
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Form.Item name="code" label="客户编码" rules={[{ required: true, message: '请输入客户编码' }]}>
                <Input placeholder="请输入客户编码" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
                <Input placeholder="请输入客户名称" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="shortName" label="简称">
                <Input placeholder="请输入简称" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="contact" label="联系人">
                <Input placeholder="请输入联系人" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="phone" label="电话">
                <Input placeholder="请输入电话" style={{ borderRadius: 8 }} />
              </Form.Item>
              <Form.Item name="taxCode" label="税号">
                <Input placeholder="请输入税号" style={{ borderRadius: 8 }} />
              </Form.Item>
            </div>
            <Form.Item name="address" label="地址">
              <Input.TextArea 
                placeholder="请输入地址" 
                rows={3}
                style={{ borderRadius: 8 }} 
              />
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
}

export default CustomerPage;
