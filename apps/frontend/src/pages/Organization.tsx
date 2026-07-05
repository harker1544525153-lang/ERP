import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, TreeSelect, App as AntApp } from 'antd';
import { motion } from 'framer-motion';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined, TeamOutlined } from '@ant-design/icons';
import { getOrganizations, getOrganizationTree, createOrganization, updateOrganization, deleteOrganization } from '@/api/organization';
import { getUserFromStorage } from '@/utils/storage';
import { exportToCSV } from '@/utils/export';

type Organization = { id: string; name: string; code: string; type: string; parentId: string | null; tenantId: string; parent?: { name: string }; children?: Organization[] };

function OrganizationPage() {
  const { message } = AntApp.useApp();
  const [data, setData] = useState<Organization[]>([]);
  const [treeData, setTreeData] = useState<Organization[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const user = getUserFromStorage();
    if (user.tenantId) {
      getOrganizations(user.tenantId).then(res => setData(res.data));
      getOrganizationTree(user.tenantId).then(res => setTreeData(res.data));
    }
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Organization) => {
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
        deleteOrganization(id).then((response) => {
          message.success(response.message || '删除成功');
          const user = getUserFromStorage();
          getOrganizations(user.tenantId).then(res => setData(res.data));
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
        updateOrganization(editingId, data).then((response) => {
          message.success(response.message || '更新成功');
          setModalVisible(false);
          getOrganizations(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '更新失败');
        });
      } else {
        createOrganization(data).then((response) => {
          message.success(response.message || '创建成功');
          setModalVisible(false);
          getOrganizations(user.tenantId).then(res => setData(res.data));
        }).catch((error: any) => {
          message.error(error.response?.data?.message || '创建失败');
        });
      }
    });
  };

  const handleExport = () => {
    const exportColumns = [
      { key: 'name', title: '组织名称', render: (_, record) => getOrgPath(record.id) },
      { key: 'code', title: '组织编码' },
      { key: 'type', title: '组织类型', render: (type) => ({ company: '公司', department: '部门', branch: '分公司' }[type] || type) },
      { key: 'parentId', title: '上级组织', render: (parentId) => parentId ? data.find(o => o.id === parentId)?.name : '-' },
    ];
    exportToCSV(filteredData, exportColumns, '组织架构');
    message.success('导出成功');
  };

  const filteredData = data.filter(item => 
    item.name.includes(searchText) || 
    item.code.includes(searchText)
  );

  const getOrgPath = (orgId: string): string => {
    const path: string[] = [];
    let currentOrg = data.find(o => o.id === orgId);
    while (currentOrg) {
      path.unshift(currentOrg.name);
      if (currentOrg.parentId) {
        currentOrg = data.find(o => o.id === currentOrg.parentId);
      } else {
        break;
      }
    }
    return path.length > 0 ? path.join(' / ') : '-';
  };

  const columns = [
    { 
      title: '组织名称', 
      key: 'name', 
      width: 250,
      render: (_: unknown, record: Organization) => getOrgPath(record.id),
    },
    { title: '组织编码', dataIndex: 'code', key: 'code', width: 120 },
    { title: '组织类型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '上级组织', dataIndex: ['parent', 'name'], key: 'parent', width: 150 },
    { 
      title: '操作', 
      key: 'action',
      width: 120,
      render: (_: unknown, record: Organization) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} style={{ borderRadius: 8 }} />
          <Button icon={<DeleteOutlined />} size="small" danger onClick={() => handleDelete(record.id)} style={{ borderRadius: 8 }} />
        </div>
      ),
    },
  ];

  const treeSelectData = treeData.map(item => {
    const convertNode = (node: Organization) => ({
      title: node.name,
      value: node.id,
      children: node.children?.map(convertNode),
    });
    return convertNode(item);
  });

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <TeamOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">组织架构管理</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="action-bar"
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <Input
            placeholder="搜索组织名称、编码..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300, borderRadius: 8 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExport} style={{ borderRadius: 8 }}>导出</Button>
        </div>
        <Button icon={<PlusOutlined />} type="primary" onClick={handleAdd} style={{ borderRadius: 8 }}>
          新增组织
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
        title={editingId ? '编辑组织' : '新增组织'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="组织名称" rules={[{ required: true, message: '请输入组织名称' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="code" label="组织编码" rules={[{ required: true, message: '请输入组织编码' }]}>
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="type" label="组织类型">
            <Input style={{ borderRadius: 8 }} />
          </Form.Item>
          <Form.Item name="parentId" label="上级组织">
            <TreeSelect treeData={treeSelectData} placeholder="选择上级组织" allowClear style={{ borderRadius: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default OrganizationPage;
