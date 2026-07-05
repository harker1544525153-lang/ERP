import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/api/warehouse';
import { getUserFromStorage } from '@/utils/storage';
type Warehouse = { id: string; code: string; name: string; address: string; tenantId: string };

function WarehousePage() {
  const [data, setData] = useState<Warehouse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getWarehouses(user.tenantId).then(res => setData(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Warehouse) => {
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
        deleteWarehouse(id).then((response) => {
          message.success(response.message || '删除成功');
          const user = getUserFromStorage();
          getWarehouses(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '删除失败');
        });
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const user = getUserFromStorage();
      const submitData = { ...values, tenantId: user.tenantId };
      
      if (editingId) {
        updateWarehouse(editingId, submitData).then((response) => {
          message.success(response.message || '更新成功');
          setModalVisible(false);
          getWarehouses(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '更新失败');
        });
      } else {
        createWarehouse(submitData).then((response) => {
          message.success(response.message || '创建成功');
          setModalVisible(false);
          getWarehouses(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '创建失败');
        });
      }
    }).catch(() => {
      message.error('表单验证失败');
    });
  };

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: '仓库编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '仓库名称', dataIndex: 'name', key: 'name' },
    { 
      title: '仓库地址', 
      dataIndex: 'address', 
      key: 'address',
      ellipsis: true,
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      render: (_: unknown, record: Warehouse) => (
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
        <InboxOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">仓库管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索仓库编码、名称..."
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
          新增仓库
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
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={modalVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Modal
          title={editingId ? '编辑仓库' : '新增仓库'}
          visible={modalVisible}
          onOk={handleSubmit}
          onCancel={() => setModalVisible(false)}
          width={500}
        >
          <Form form={form} layout="vertical">
            <Form.Item name="code" label="仓库编码" rules={[{ required: true, message: '请输入仓库编码' }]}>
              <Input placeholder="请输入仓库编码" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="name" label="仓库名称" rules={[{ required: true, message: '请输入仓库名称' }]}>
              <Input placeholder="请输入仓库名称" style={{ borderRadius: 8 }} />
            </Form.Item>
            <Form.Item name="address" label="仓库地址">
              <Input.TextArea 
                placeholder="请输入仓库地址" 
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

export default WarehousePage;
