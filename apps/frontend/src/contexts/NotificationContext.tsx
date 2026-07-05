import React, { useState, useCallback } from 'react';
import { ShoppingCartOutlined, FileTextOutlined, CreditCardOutlined, WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'read' | 'unread';
  time: string;
  icon: React.ElementType;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: '采购订单审核通过',
    description: '您提交的采购订单 PO-2024-001 已通过审核',
    type: 'purchase',
    status: 'read',
    time: '2024-01-15 10:30',
    icon: ShoppingCartOutlined,
  },
  {
    id: '2',
    title: '销售订单已发货',
    description: '销售订单 SO-2024-003 的货物已发出',
    type: 'sale',
    status: 'read',
    time: '2024-01-15 09:15',
    icon: ShoppingCartOutlined,
  },
  {
    id: '3',
    title: '凭证审核通知',
    description: '凭证 V-2024-001 需要您进行审核',
    type: 'voucher',
    status: 'unread',
    time: '2024-01-15 08:45',
    icon: FileTextOutlined,
  },
  {
    id: '4',
    title: '应收款到期提醒',
    description: '客户 A001 的应收款将于 3 天后到期',
    type: 'receivable',
    status: 'unread',
    time: '2024-01-14 16:20',
    icon: CreditCardOutlined,
  },
  {
    id: '5',
    title: '库存预警',
    description: '物料 M001 库存低于安全库存，当前库存: 50',
    type: 'inventory',
    status: 'unread',
    time: '2024-01-14 14:30',
    icon: WarningOutlined,
  },
  {
    id: '6',
    title: '付款审批通知',
    description: '供应商 S001 的付款申请需要您审批',
    type: 'payable',
    status: 'read',
    time: '2024-01-14 11:00',
    icon: CreditCardOutlined,
  },
  {
    id: '7',
    title: '新用户注册',
    description: '新用户 李财务总监 已注册成功',
    type: 'system',
    status: 'read',
    time: '2024-01-13 17:45',
    icon: ClockCircleOutlined,
  },
  {
    id: '8',
    title: '系统维护通知',
    description: '系统将于今晚 22:00-24:00 进行维护升级',
    type: 'system',
    status: 'unread',
    time: '2024-01-13 10:00',
    icon: WarningOutlined,
  },
];

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  deleteSelected: (ids: string[]) => void;
}

export const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' as const } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const deleteSelected = useCallback((ids: string[]) => {
    setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
        deleteNotification,
        deleteSelected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
