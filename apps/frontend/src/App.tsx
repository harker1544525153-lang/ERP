import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import User from './pages/User';
import Role from './pages/Role';
import Account from './pages/Account';
import Customer from './pages/Customer';
import Supplier from './pages/Supplier';
import Material from './pages/Material';
import Warehouse from './pages/Warehouse';
import Voucher from './pages/Voucher';
import Purchase from './pages/Purchase';
import Sale from './pages/Sale';
import Inventory from './pages/Inventory';
import Receivable from './pages/Receivable';
import Payable from './pages/Payable';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Notification from './pages/Notification';
import { NotificationProvider } from './contexts/NotificationContext';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

function App() {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isDark = currentTheme === 'dark';

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#4f46e5',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <AntApp>
        <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
          <NotificationProvider>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>
              <Route index element={<Dashboard />} />
              <Route path="organization" element={<Organization />} />
              <Route path="user" element={<User />} />
              <Route path="role" element={<Role />} />
              <Route path="account" element={<Account />} />
              <Route path="customer" element={<Customer />} />
              <Route path="supplier" element={<Supplier />} />
              <Route path="material" element={<Material />} />
              <Route path="warehouse" element={<Warehouse />} />
              <Route path="voucher" element={<Voucher />} />
              <Route path="purchase" element={<Purchase />} />
              <Route path="sale" element={<Sale />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="receivable" element={<Receivable />} />
              <Route path="payable" element={<Payable />} />
              <Route path="report" element={<Report />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
              <Route path="notification" element={<Notification />} />
            </Route>
          </Routes>
          </NotificationProvider>
        </ThemeContext.Provider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
