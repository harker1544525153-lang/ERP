import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Checkbox, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserOutlined, LockOutlined, LoginOutlined, EyeOutlined, EyeInvisibleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { login } from '@/api/auth';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('storage'));
      message.success(response.message || '登录成功');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || '登录失败');
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #0891b2 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          background: 'rgba(91, 78, 249, 0.15)',
          borderRadius: '50%',
          top: -250,
          left: -150,
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          background: 'rgba(8, 145, 178, 0.15)',
          borderRadius: '50%',
          bottom: -200,
          right: -100,
          filter: 'blur(50px)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          background: 'rgba(192, 132, 252, 0.1)',
          borderRadius: '50%',
          top: '40%',
          left: '30%',
          filter: 'blur(80px)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -30 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ zIndex: 10, width: '100%', maxWidth: 440, padding: '0 20px' }}
      >
        <Card
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '24px',
            boxShadow: isHovered
              ? '0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(91, 78, 249, 0.15)'
              : '0 20px 40px -12px rgba(0, 0, 0, 0.2), 0 0 30px rgba(91, 78, 249, 0.1)',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          }}
        >
          <motion.div
            style={{
              background: 'linear-gradient(135deg, #5b4ef9 0%, #0891b2 100%)',
              padding: '32px',
              margin: '-24px -24px 24px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                width: 150,
                height: 150,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                top: -75,
                right: -75,
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
              style={{
                width: 72,
                height: 72,
                background: 'rgba(255,255,255,0.18)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <motion.div
                animate={{
                  boxShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 25px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppstoreOutlined style={{ fontSize: 28, color: '#fff' }} />
              </motion.div>
            </motion.div>

            <Title level={3} style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 700 }}>
              ERP系统
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 8, display: 'block' }}>
              企业资源管理系统
            </Text>
          </motion.div>

          <Form name="login" onFinish={onFinish} layout="vertical" size="large">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <motion.div
                  style={{
                    position: 'relative',
                  }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#94a3b8', fontSize: 18 }} />}
                    placeholder="请输入用户名"
                    style={{
                      borderRadius: '14px',
                      height: 52,
                      border: '1.5px solid rgba(148, 163, 184, 0.2)',
                      transition: 'all 0.25s ease',
                      fontSize: 15,
                      padding: '0 16px',
                    }}
                  />
                  <motion.div
                    className="focus-ring"
                    style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '16px',
                      border: '2px solid transparent',
                      pointerEvents: 'none',
                    }}
                    whileFocus={{
                      borderColor: 'linear-gradient(135deg, #5b4ef9, #0891b2)',
                      boxShadow: '0 0 20px rgba(91, 78, 249, 0.2)',
                    }}
                  />
                </motion.div>
              </Form.Item>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: 18 }} />}
                  placeholder="请输入密码"
                  iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                  style={{
                    borderRadius: '14px',
                    height: 52,
                    border: '1.5px solid rgba(148, 163, 184, 0.2)',
                    transition: 'all 0.25s ease',
                    fontSize: 15,
                    padding: '0 16px',
                  }}
                />
              </Form.Item>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}
            >
              <motion.div whileHover={{ scale: 1.02 }}>
                <Checkbox 
                  defaultChecked 
                  style={{ 
                    color: 'var(--text-secondary)',
                    borderRadius: 6,
                  }}
                >
                  记住我
                </Checkbox>
              </motion.div>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05, color: '#5b4ef9' }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                  color: '#5b4ef9',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
              >
                忘记密码？
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ width: '100%' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<LoginOutlined style={{ fontSize: 18 }} />}
                  style={{
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #5b4ef9 0%, #0891b2 100%)',
                    border: 'none',
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: '0 6px 20px rgba(91, 78, 249, 0.4)',
                    transition: 'all 0.3s ease',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ textAlign: 'center', marginTop: 24 }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                默认账号：
                <span style={{ color: '#5b4ef9', fontWeight: 600, margin: '0 4px' }}>admin</span>
                / 密码：
                <span style={{ color: '#5b4ef9', fontWeight: 600, margin: '0 4px' }}>123456</span>
              </Text>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: '1px solid rgba(148, 163, 184, 0.15)',
                textAlign: 'center',
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                还没有账号？
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05, color: '#5b4ef9' }}
                  style={{ 
                    color: '#5b4ef9',
                    fontWeight: 500,
                    marginLeft: 4,
                    cursor: 'pointer',
                  }}
                >
                  联系管理员开通
                </motion.a>
              </Text>
            </motion.div>
          </Form>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.9)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        © 2024 ERP System. All rights reserved.
      </motion.div>

      <Modal
        title="登录失败"
        open={errorVisible}
        onCancel={() => setErrorVisible(false)}
        okText="确定"
        onOk={() => setErrorVisible(false)}
        centered
      >
        <p>{errorMessage}</p>
      </Modal>
    </div>
  );
}

export default Login;