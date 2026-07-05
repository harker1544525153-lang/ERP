import { useState } from 'react';
import { Card, Input, Button, Tabs, Collapse, message } from 'antd';
import { motion } from 'framer-motion';
import { QuestionCircleOutlined, SearchOutlined, MessageOutlined, FileTextOutlined, PhoneOutlined } from '@ant-design/icons';

const faqs = [
  {
    key: '1',
    title: '如何登录系统？',
    content: '请使用您的用户名和密码登录系统。如果忘记密码，请联系管理员进行重置。',
  },
  {
    key: '2',
    title: '如何创建新用户？',
    content: '在用户管理页面点击"新增用户"按钮，填写用户信息并选择所属组织和角色即可创建新用户。',
  },
  {
    key: '3',
    title: '如何设置组织架构？',
    content: '在组织架构页面点击"新增组织"按钮，填写组织名称、编码等信息，并选择上级组织（可选）。系统支持无限层级的组织架构。',
  },
  {
    key: '4',
    title: '如何录入凭证？',
    content: '在凭证管理页面点击"新增凭证"按钮，填写凭证日期、摘要，并添加分录。每条分录需要选择会计科目并输入借方或贷方金额。',
  },
  {
    key: '5',
    title: '如何进行采购入库？',
    content: '在采购管理页面创建采购订单，然后在库存管理页面进行入库操作。系统会自动生成相应的会计凭证。',
  },
  {
    key: '6',
    title: '如何查看报表？',
    content: '在报表中心页面可以查看各种财务报表和业务报表。支持按时间范围筛选和导出功能。',
  },
];

const guides = [
  {
    title: '系统入门指南',
    description: '了解系统基本操作和功能模块',
    icon: FileTextOutlined,
  },
  {
    title: '财务管理手册',
    description: '详细介绍凭证、科目、报表等财务功能',
    icon: FileTextOutlined,
  },
  {
    title: '采购管理手册',
    description: '采购流程和采购订单管理',
    icon: FileTextOutlined,
  },
  {
    title: '销售管理手册',
    description: '销售流程和销售订单管理',
    icon: FileTextOutlined,
  },
  {
    title: '库存管理手册',
    description: '库存出入库和盘点管理',
    icon: FileTextOutlined,
  },
];

function HelpPage() {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const filteredFaqs = faqs.filter(faq =>
    faq.title.toLowerCase().includes(searchText.toLowerCase()) ||
    faq.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = () => {
    message.info(`搜索结果：${filteredFaqs.length} 条`);
  };

  const handleContact = () => {
    message.info('联系客服功能正在开发中，请发送邮件至 support@huayou.com');
  };

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <QuestionCircleOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">帮助中心</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card" style={{ padding: 24, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12, maxWidth: 600, margin: '0 auto' }}>
            <Input
              placeholder="搜索帮助文档..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, borderRadius: 8 }}
              onPressEnter={handleSearch}
            />
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ borderRadius: 8 }}
            >
              搜索
            </Button>
          </div>
        </Card>

        <Card className="glass-card" style={{ padding: 24, borderRadius: 12 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab={<span><QuestionCircleOutlined /> 常见问题</span>} key="faq">
              <Collapse
                items={filteredFaqs}
                bordered={false}
                style={{ background: 'transparent' }}
                defaultActiveKey={['1']}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab={<span><FileTextOutlined /> 使用手册</span>} key="guide">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {guides.map((guide, index) => {
                  const IconComponent = guide.icon;
                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: 20,
                        border: '1px solid var(--border-color)',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <IconComponent style={{ fontSize: 32, color: '#4f46e5', marginBottom: 12 }} />
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {guide.title}
                      </h4>
                      <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                        {guide.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane tab={<span><PhoneOutlined /> 联系客服</span>} key="contact">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                  }}
                >
                  <PhoneOutlined style={{ fontSize: 48, color: '#4f46e5' }} />
                </motion.div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
                  需要帮助？
                </h3>
                <p style={{ margin: '16px 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                  我们的客服团队随时为您提供支持
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: 14 }}>
                    <MessageOutlined style={{ marginRight: 8, color: '#4f46e5' }} />
                    support@huayou.com
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContact}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 500,
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    联系客服
                  </motion.button>
                </div>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}

export default HelpPage;