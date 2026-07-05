import { useState, useEffect } from 'react';
import { Form, Input, Switch, Select, Card, Button, message, Tabs } from 'antd';
import { motion } from 'framer-motion';
import { SettingOutlined, BellOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';

function SettingsPage() {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    form.setFieldsValue({
      systemName: 'ERP系统',
      systemLogo: '',
      defaultTheme: 'light',
      language: 'zh-CN',
      enableNotifications: true,
      enableEmailNotifications: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableTwoFactorAuth: false,
    });
  }, []);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      localStorage.setItem('settings', JSON.stringify(values));
      message.success('系统设置保存成功');
    });
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <SettingOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">系统设置</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card" style={{ padding: 24, borderRadius: 12 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }}>
            <Tabs.TabPane tab={<span><GlobalOutlined /> 基本设置</span>} key="basic">
              <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="systemName" label="系统名称" rules={[{ required: true, message: '请输入系统名称' }]}>
                    <Input style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="defaultTheme" label="默认主题">
                    <Select
                      options={[
                        { value: 'light', label: '亮色模式' },
                        { value: 'dark', label: '暗色模式' },
                      ]}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                  <Form.Item name="language" label="系统语言">
                    <Select
                      options={[
                        { value: 'zh-CN', label: '简体中文' },
                        { value: 'en-US', label: 'English' },
                      ]}
                      style={{ borderRadius: 8 }}
                    />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
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
                    保存设置
                  </motion.button>
                </div>
              </Form>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<span><BellOutlined /> 通知设置</span>} key="notification">
              <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="enableNotifications" label="启用系统通知" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item name="enableEmailNotifications" label="启用邮件通知" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
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
                    保存设置
                  </motion.button>
                </div>
              </Form>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<span><LockOutlined /> 安全设置</span>} key="security">
              <Form form={form} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Form.Item name="sessionTimeout" label="会话超时时间（分钟）" rules={[{ required: true, type: 'number', min: 5, max: 120 }]}>
                    <Input type="number" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="maxLoginAttempts" label="最大登录尝试次数" rules={[{ required: true, type: 'number', min: 3, max: 10 }]}>
                    <Input type="number" style={{ borderRadius: 8 }} />
                  </Form.Item>
                  <Form.Item name="enableTwoFactorAuth" label="启用双因素认证" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
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
                    保存设置
                  </motion.button>
                </div>
              </Form>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}

export default SettingsPage;