import { useState, useEffect } from 'react';
import api from '../../../../shared/api/api';
import { AdminDashboardData, ApiResponse } from '../types/admin.types';

export const useAdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard data from backend
        // Update the endpoint based on your backend routes
        const response = await api.get<ApiResponse<AdminDashboardData>>(
          '/api/admin/dashboard'
        );
        
        setData(response.data.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
        setError(errorMessage);
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
};

// Fetch stats separately if needed
export const useDashboardStats = () => {
  const [stats, setStats] = useState<AdminDashboardData['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<ApiResponse<AdminDashboardData>>(
          '/api/admin/stats'
        );
        
        setStats(response.data.data.stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

// Fetch recent orders separately if needed
export const useRecentOrders = () => {
  const [orders, setOrders] = useState<AdminDashboardData['recentOrders'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<ApiResponse<AdminDashboardData>>(
          '/api/admin/orders/recent'
        );
        
        setOrders(response.data.data.recentOrders);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent orders';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading, error };
};

// Fetch recent users separately if needed
export const useRecentUsers = () => {
  const [users, setUsers] = useState<AdminDashboardData['recentUsers'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<ApiResponse<AdminDashboardData>>(
          '/api/admin/users/recent'
        );
        
        setUsers(response.data.data.recentUsers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent users';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};
