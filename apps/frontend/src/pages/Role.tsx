import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, KeyOutlined } from '@ant-design/icons';
import { getRoles, createRole, updateRole, deleteRole } from '@/api/role';
import { getUserFromStorage } from '@/utils/storage';

type Role = { id: string; name: string; code: string; permissions: string; tenantId: string };

function RolePage() {
  const [data, setData] = useState<Role[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getRoles(user.tenantId).then(res => setData(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
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
        deleteRole(id).then((response) => {
          message.success(response.message || '删除成功');
          const user = getUserFromStorage();
          getRoles(user.tenantId).then(res => setData(res.data));
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
        updateRole(editingId, data).then((response) => {
          message.success(response.message || '更新成功');
          setModalVisible(false);
          getRoles(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '更新失败');
        });
      } else {
        createRole(data).then((response) => {
          message.success(response.message || '创建成功');
          setModalVisible(false);
          getRoles(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '创建失败');
        });
      }
    });
  };

  const filteredData = data.filter(item => 
    item.name.includes(searchText) || 
    item.code.includes(searchText)
  );

  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '角色编码', dataIndex: 'code', key: 'code', width: 120 },
    { 
      title: '权限', 
      dataIndex: 'permissions', 
      key: 'permissions',
      render: (p: string) => { 
        try { 
          const perms = JSON.parse(p);
          return perms.length > 3 ? `${perms.slice(0, 3).join(', ')}...` : perms.join(', ');
        } catch { 
          return p; 
        } 
      },
    },
    { 
      title: '操作', 
      key: 'action',
      width: 120,
      render: (_: unknown, record: Role) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ borderRadius: 8 }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} style={{ borderRadius: 8 }} />
        </div>
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
        <KeyOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">角色权限管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <Input
          placeholder="搜索角色名称、编码..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, borderRadius: 8 }}
        />
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd} style={{ borderRadius: 8 }}>
          新增角色
        </Button>
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
          />
        </div>
      </motion.div>

      <Modal
        title={editingId ? '编辑角色' : '新增角色'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="permissions" label="权限（逗号分隔）">
            <Input.TextArea placeholder="如: org:view,user:edit" style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default RolePage;
