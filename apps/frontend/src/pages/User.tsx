import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, TreeSelect, message, Tag } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '@/api/user';
import { getOrganizations, getOrganizationTree } from '@/api/organization';
import { getRoles } from '@/api/role';
import { getUserFromStorage } from '@/utils/storage';
import { exportToCSV } from '@/utils/export';

type User = { id: string; username: string; realName: string; orgId: string; roleId: string; email: string; phone: string; status: string; tenantId: string; organization?: { name: string }; role?: { name: string } };
type Organization = { id: string; name: string; parentId: string | null; children?: Organization[] };
type Role = { id: string; name: string };

function UserPage() {
  const [data, setData] = useState<User[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgTree, setOrgTree] = useState<Organization[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getUsers(user.tenantId).then(res => setData(res.data));
      getOrganizations(user.tenantId).then(res => setOrgs(res.data));
      getOrganizationTree(user.tenantId).then(res => setOrgTree(res.data));
      getRoles(user.tenantId).then(res => setRoles(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: User) => {
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
        deleteUser(id).then((response) => {
          message.success(response.message || '删除成功');
          const user = getUserFromStorage();
          getUsers(user.tenantId).then(res => setData(res.data));
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
        updateUser(editingId, data).then((response) => {
          message.success(response.message || '更新成功');
          setModalVisible(false);
          getUsers(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '更新失败');
        });
      } else {
        createUser(data).then((response) => {
          message.success(response.message || '创建成功');
          setModalVisible(false);
          getUsers(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '创建失败');
        });
      }
    });
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'username', title: '用户名' },
      { key: 'realName', title: '真实姓名' },
      { key: 'orgId', title: '所属组织', render: (_, record) => getOrgPath(record.orgId) },
      { key: 'roleId', title: '角色', render: (_, record) => roles.find(r => r.id === record.roleId)?.name || '-' },
      { key: 'email', title: '邮箱' },
      { key: 'phone', title: '手机号' },
      { key: 'status', title: '状态', render: (status) => status === 'active' ? '启用' : '禁用' },
    ];
    exportToCSV(filteredData, exportColumns, '用户列表');
    message.success('导出成功');
  };

  const filteredData = data.filter(item => 
    item.username.includes(searchText) || 
    item.realName.includes(searchText) ||
    item.email.includes(searchText)
  );

  const getOrgPath = (orgId: string): string => {
    const path: string[] = [];
    let currentOrg = orgs.find(o => o.id === orgId);
    while (currentOrg) {
      path.unshift(currentOrg.name);
      if (currentOrg.parentId) {
        currentOrg = orgs.find(o => o.id === currentOrg.parentId);
      } else {
        break;
      }
    }
    return path.length > 0 ? path.join(' / ') : '-';
  };

  const columns = [
    { 
      title: '用户名', 
      dataIndex: 'username', 
      key: 'username',
      width: 120,
    },
    { title: '真实姓名', dataIndex: 'realName', key: 'realName', width: 120 },
    { 
      title: '所属组织', 
      key: 'organization', 
      width: 250,
      render: (_: unknown, record: User) => getOrgPath(record.orgId),
    },
    { title: '角色', dataIndex: ['role', 'name'], key: 'role', width: 100 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 200 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 130 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 80,
      render: (s: string) => (
        <Tag color={s === 'active' ? 'success' : 'default'}>
          {s === 'active' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    { 
      title: '操作', 
      key: 'action',
      width: 120,
      render: (_: unknown, record: User) => (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', gap: 8 }}
        >
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
            style={{ borderRadius: 8 }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDelete(record.id)}
            style={{ borderRadius: 8 }}
          />
        </motion.div>
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
        <UserOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">用户管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索用户名、姓名、邮箱..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ borderRadius: 8 }}>导出</Button>
        </div>
        <Button 
          icon={<PlusOutlined />} 
          type="primary" 
          onClick={handleAdd}
          style={{ borderRadius: 8 }}
        >
          新增用户
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
            onRow={(record) => ({
              style: { 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                borderRadius: 8,
              },
            })}
          />
        </div>
      </motion.div>

      <Modal
        title={editingId ? '编辑用户' : '新增用户'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input disabled={!!editingId} style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="password" label={editingId ? '新密码' : '密码'} rules={[{ required: !editingId, message: '请输入密码' }]}>
            <Input.Password style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="orgId" label="所属组织" rules={[{ required: true, message: '请选择所属组织' }]}>
            <TreeSelect 
              treeData={orgTree.map(item => {
                const convertNode = (node: Organization) => ({
                  title: node.name,
                  value: node.id,
                  children: node.children?.map(convertNode),
                });
                return convertNode(item);
              })} 
              placeholder="选择所属组织" 
              style={{ borderRadius: 8 }} 
            />
          </Form.Item>
          <Form.Item name="roleId" label="角色">
            <Select options={roles.map(r => ({ value: r.id, label: r.name }))} allowClear style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { UserOutlined } from '@ant-design/icons';
export default UserPage;
