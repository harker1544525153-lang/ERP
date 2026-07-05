import { useState, useContext } from 'react';
import { Card, Button, List, Tag, Checkbox, message } from 'antd';
import { motion } from 'framer-motion';
import { BellOutlined, CheckOutlined, FilterOutlined } from '@ant-design/icons';
import { NotificationContext } from '../contexts/NotificationContext';

const typeMap: Record<string, { color: string; label: string }> = {
  purchase: { color: '#10b981', label: '采购' },
  sale: { color: '#3b82f6', label: '销售' },
  voucher: { color: '#8b5cf6', label: '凭证' },
  receivable: { color: '#f59e0b', label: '应收' },
  payable: { color: '#ef4444', label: '应付' },
  inventory: { color: '#f97316', label: '库存' },
  system: { color: '#64748b', label: '系统' },
};

function NotificationPage() {
  const notificationContext = useContext(NotificationContext);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  const data = notificationContext?.notifications || [];

  const filteredData = filterType === 'all' 
    ? data 
    : data.filter(n => n.type === filterType);

  const handleMarkAsRead = (id: string) => {
    notificationContext?.markAsRead(id);
    message.success('已标记为已读');
  };

  const handleMarkAllRead = () => {
    notificationContext?.markAllRead();
    message.success('全部已标记为已读');
  };

  const handleDelete = (id: string) => {
    notificationContext?.deleteNotification(id);
    message.success('删除成功');
  };

  const handleDeleteSelected = () => {
    notificationContext?.deleteSelected(selectedIds);
    setSelectedIds([]);
    message.success(`已删除 ${selectedIds.length} 条通知`);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredData.map(n => n.id) : []);
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const types = [
    { value: 'all', label: '全部' },
    { value: 'purchase', label: '采购' },
    { value: 'sale', label: '销售' },
    { value: 'voucher', label: '凭证' },
    { value: 'receivable', label: '应收' },
    { value: 'payable', label: '应付' },
    { value: 'inventory', label: '库存' },
    { value: 'system', label: '系统' },
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-title"
      >
        <BellOutlined style={{ color: '#4f46e5' }} />
        <span className="text-gradient">消息通知</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card" style={{ padding: 24, borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                onClick={handleMarkAllRead}
                style={{ borderRadius: 8 }}
              >
                <CheckOutlined /> 全部已读
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  danger
                  onClick={handleDeleteSelected}
                  style={{ borderRadius: 8 }}
                >
                  删除选中 ({selectedIds.length})
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <FilterOutlined style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
              {types.map(type => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilterType(type.value)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: filterType === type.value ? 'none' : '1px solid var(--border-color)',
                    background: filterType === type.value ? 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)' : 'transparent',
                    color: filterType === type.value ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          <List
            dataSource={filteredData}
            renderItem={(item) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01, x: 4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    border: '1px solid var(--border-color)',
                    borderRadius: 12,
                    marginBottom: 12,
                    background: item.status === 'unread' ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={(e) => handleSelect(item.id, e.target.checked)}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${typeMap[item.type]?.color}20 0%, ${typeMap[item.type]?.color}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconComponent style={{ fontSize: 20, color: typeMap[item.type]?.color }} />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {item.title}
                      </h4>
                      {item.status === 'unread' && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                      )}
                      <Tag color={typeMap[item.type]?.color} style={{ borderRadius: 4, fontSize: 12 }}>
                        {typeMap[item.type]?.label}
                      </Tag>
                    </div>
                    <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                      {item.description}
                    </p>
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {item.time}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.status === 'unread' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleMarkAsRead(item.id); }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        标为已读
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 13,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      删除
                    </motion.button>
                  </div>
                </motion.div>
              );
            }}
            header={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                <Checkbox
                  checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < filteredData.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  共 {filteredData.length} 条通知
                  {filterType !== 'all' && (
                    <span style={{ marginLeft: 8 }}>
                      （{data.filter(n => n.status === 'unread').length} 条未读）
                    </span>
                  )}
                </span>
              </div>
            }
          />
        </Card>
      </motion.div>
    </div>
  );
}

export default NotificationPage;
