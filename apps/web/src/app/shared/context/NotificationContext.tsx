import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Get user ID from local storage or wherever it is stored
  const user: string | null = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  useEffect(() => {
    const NOTIFICATION_URL = import.meta.env.VITE_NOTIFICATION_SOCKET_URL || 'http://localhost:3006';

    const newSocket = io(NOTIFICATION_URL, {
      query: { userId }
    });

    setSocket(newSocket);

    newSocket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
