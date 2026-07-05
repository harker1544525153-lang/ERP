import { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Space, Tooltip, Badge } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  KeyOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  InboxOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { ThemeContext } from '../App';
import { NotificationContext } from '../contexts/NotificationContext';

const { Header, Sider, Content } = AntLayout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '首页仪表盘' },
  { type: 'divider' as const },
  { key: '/organization', icon: <TeamOutlined />, label: '组织架构' },
  { key: '/user', icon: <UserOutlined />, label: '用户管理' },
  { key: '/role', icon: <KeyOutlined />, label: '角色权限' },
  { type: 'divider' as const },
  { key: '/account', icon: <BookOutlined />, label: '会计科目' },
  { key: '/voucher', icon: <FileTextOutlined />, label: '凭证管理' },
  { type: 'divider' as const },
  { key: '/customer', icon: <CustomerServiceOutlined />, label: '客户管理' },
  { key: '/supplier', icon: <ShoppingCartOutlined />, label: '供应商管理' },
  { key: '/material', icon: <AppstoreOutlined />, label: '物料管理' },
  { key: '/warehouse', icon: <InboxOutlined />, label: '仓库管理' },
  { type: 'divider' as const },
  { key: '/purchase', icon: <ShoppingCartOutlined />, label: '采购管理' },
  { key: '/sale', icon: <ShoppingOutlined />, label: '销售管理' },
  { key: '/inventory', icon: <InboxOutlined />, label: '库存管理' },
  { type: 'divider' as const },
  { key: '/receivable', icon: <DollarCircleOutlined />, label: '应收管理' },
  { key: '/payable', icon: <CreditCardOutlined />, label: '应付管理' },
  { type: 'divider' as const },
  { key: '/report', icon: <BarChartOutlined />, label: '报表中心' },
];

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('/');
  const navigate = useNavigate();
  const location = useLocation();
  const themeContext = useContext(ThemeContext);
  const notificationContext = useContext(NotificationContext);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser({});
      }
    }
    setActiveMenu(location.pathname);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMenuClick = (e: { key: string }) => {
    setActiveMenu(e.key);
    navigate(e.key);
  };

  const userMenu = [
    { key: 'profile', label: '个人信息', icon: <UserOutlined /> },
    { key: 'settings', label: '系统设置', icon: <SettingOutlined /> },
    { type: 'divider' as const },
    { key: 'logout', label: '退出登录', icon: <LogoutOutlined /> },
  ];

  const handleUserMenuClick = (e: { key: string }) => {
    if (e.key === 'logout') {
      handleLogout();
    } else if (e.key === 'profile') {
      navigate('/profile');
    } else if (e.key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="glass-sidebar"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <motion.div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #5b4ef9 0%, #0891b2 100%)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
          >
            <motion.div
              style={{
                position: 'absolute',
                width: 100,
                height: 100,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                top: -50,
                right: -50,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                width: 60,
                height: 60,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
                bottom: -30,
                left: -30,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="animate-fadeIn"
            >
              {collapsed ? (
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: 24 }}
                >
                  E
                </motion.span>
              ) : (
                'ERP系统'
              )}
            </motion.span>
          </motion.div>

          <motion.div
            style={{ padding: '16px 12px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Menu
              theme="dark"
              mode="inline"
              items={menuItems}
              onClick={handleMenuClick}
              selectedKeys={[activeMenu]}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
              }}
              menuItemSelectedProps={{
                style: {
                  background: 'linear-gradient(135deg, rgba(91, 78, 249, 0.4) 0%, rgba(8, 145, 178, 0.3) 100%)',
                  borderRadius: 8,
                  borderLeft: '3px solid #5b4ef9',
                },
              }}
              menuItemProps={{
                style: {
                  borderRadius: 8,
                  marginBottom: 4,
                  transition: 'all 0.2s ease',
                },
              }}
            />
          </motion.div>

          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                color: '#fff',
                width: '100%',
                height: 40,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {collapsed ? <RightOutlined style={{ fontSize: 18 }} /> : <LeftOutlined style={{ fontSize: 18 }} />}
            </motion.button>
          </motion.div>
        </Sider>
      </motion.div>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)', padding: 0 }}>
        <Header className="glass-header" style={{ position: 'fixed', right: 0, left: collapsed ? 80 : 256, zIndex: 999, height: 64 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 24px',
              height: '100%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-gradient"
              style={{ fontSize: 18, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <motion.div
                animate={{
                  boxShadow: ['0 0 5px rgba(91, 78, 249, 0.5)', '0 0 20px rgba(91, 78, 249, 0.8)', '0 0 5px rgba(91, 78, 249, 0.5)'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #5b4ef9, #0891b2)',
                }}
              />
              企业资源管理系统
            </motion.div>

            <Space size="middle">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/notification')}
                style={{
                  position: 'relative',
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  color: 'var(--text-primary)',
                }}
              >
                <BellOutlined style={{ fontSize: 20 }} />
                <Badge
                  count={notificationContext?.unreadCount || 0}
                  size="small"
                  style={{
                    backgroundColor: '#ef4444',
                    top: -4,
                    right: -4,
                    borderRadius: 6,
                  }}
                />
              </motion.button>

              <Tooltip title={themeContext?.theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9, rotate: -10 }}
                  onClick={themeContext?.toggleTheme}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-primary)',
                  }}
                >
                  {themeContext?.theme === 'dark' ? <SunOutlined style={{ fontSize: 20 }} /> : <MoonOutlined style={{ fontSize: 20 }} />}
                </motion.button>
              </Tooltip>

              <Tooltip title="帮助中心">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/help')}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-primary)',
                  }}
                >
                  <QuestionCircleOutlined style={{ fontSize: 20 }} />
                </motion.button>
              </Tooltip>

              <Dropdown
                menu={{ items: userMenu, onClick: handleUserMenuClick }}
                placement="bottomRight"
                arrow
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    height: 40,
                    borderRadius: 8,
                    border: 'none',
                    background: 'rgba(91, 78, 249, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 12px',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Avatar
                    size={32}
                    style={{
                      background: 'linear-gradient(135deg, #5b4ef9 0%, #0891b2 100%)',
                      fontWeight: 600,
                    }}
                  >
                    {user?.realName?.charAt(0) || '用'}
                  </Avatar>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{user?.realName || '用户'}</span>
                  <DownOutlined style={{ fontSize: 14 }} />
                </motion.button>
              </Dropdown>
            </Space>
          </div>
        </Header>

        <Content
          style={{
            padding: '80px 24px 24px',
            background: 'var(--bg-primary)',
            minHeight: 'calc(100vh - 64px)',
            margin: 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;