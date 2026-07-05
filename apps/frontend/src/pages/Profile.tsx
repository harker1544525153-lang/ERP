import { useState, useEffect } from 'react';
import { Form, Input, Button, message, Card, Avatar, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';
import { getUserFromStorage } from '@/utils/storage';
import { getOrganizations } from '@/api/organization';

type Organization = { id: string; name: string; parentId: string | null };

function ProfilePage() {
  const [form] = Form.useForm();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
      form.setFieldsValue({
        username: storedUser.username,
        realName: storedUser.realName,
        email: storedUser.email,
        phone: storedUser.phone,
        orgId: storedUser.orgId,
      });
    }
    if (storedUser?.tenantId) {
      getOrganizations(storedUser.tenantId).then(res => setOrgs(res.data));
    }
  }, []);

  const getOrgName = (orgId: string) => {
    const org = orgs.find(o => o.id === orgId);
    if (!org) return '-';
    const path: string[] = [org.name];
    let parentId = org.parentId;
    while (parentId) {
      const parent = orgs.find(o => o.id === parentId);
      if (parent) {
        path.unshift(parent.name);
        parentId = parent.parentId;
      } else {
        break;
      }
    }
    return path.join(' / ');
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const updatedUser = { ...user, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      message.success('个人信息更新成功');
    });
  };

  const handleChangePassword = () => {
    message.info('密码修改功能正在开发中');
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <UserOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">个人信息</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card" style={{ padding: 24, borderRadius: 12 }}>
          <Row gutter={24}>
            <Col span={8}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                style={{ textAlign: 'center', padding: '24px 0' }}
              >
                <Avatar
                  size={128}
                  style={{
                    background: 'linear-gradient(135deg, #5b4ef9 0%, #0891b2 100%)',
                    fontSize: 48,
                    fontWeight: 600,
                    marginBottom: 16,
                    boxShadow: '0 8px 24px rgba(91, 78, 249, 0.3)',
                  }}
                >
                  {user?.realName?.charAt(0) || '用'}
                </Avatar>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.realName || '用户'}
                </h3>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  {getOrgName(user?.orgId)}
                </p>
              </motion.div>
            </Col>
            <Col span={16}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input
                      disabled
                      prefix={<UserOutlined />}
                      style={{ borderRadius: 8, background: 'var(--bg-secondary)' }}
                    />
                  </Form.Item>
                  <Form.Item name="realName" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
                    <Input prefix={<UserOutlined />} style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '请输入正确的邮箱' }]}>
                    <Input prefix={<MailOutlined />} style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}>
                    <Input prefix={<PhoneOutlined />} style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="orgId" label="所属组织">
                    <Input
                      disabled
                      value={getOrgName(user?.orgId)}
                      prefix={<TeamOutlined />}
                      style={{ borderRadius: 8, background: 'var(--bg-secondary)' }}
                    />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 8,
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <LockOutlined />
                    修改密码
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    保存修改
                  </motion.button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
}

export default ProfilePage;