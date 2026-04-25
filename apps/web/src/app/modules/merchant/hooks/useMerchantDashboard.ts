import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { MerchantDashboardData, MerchantOrder, MerchantProduct, MerchantStat } from '../types/merchant.types';

const fallbackStats: MerchantStat[] = [
  { label: "Today's Revenue", value: '$1,284', change: '+18%', icon: '💰', color: '#fde68a' },
  { label: 'Active Orders', value: '14', change: '+3', icon: '🔥', color: '#fb923c' },
  { label: 'Products Listed', value: '38', change: '+2', icon: '🏷️', color: '#a5b4fc' },
  { label: 'Avg Rating', value: '4.8 ★', change: '+0.1', icon: '⭐', color: '#fde68a' },
];

const fallbackOrders: MerchantOrder[] = [
  { id: '#ORD-8821', customer: 'Amara Silva', items: 'Burger x1, Fries x2', status: 'New', time: '2 min', total: '$18.50' },
  { id: '#ORD-8815', customer: 'Nimal Perera', items: 'Pizza Margherita x1', status: 'Preparing', time: '12 min', total: '$22.00' },
  { id: '#ORD-8810', customer: 'Dilani Fernando', items: 'Chicken Rice x3', status: 'Ready', time: '24 min', total: '$31.50' },
  { id: '#ORD-8808', customer: 'Kasun Silva', items: 'Wrap x2, Juice x2', status: 'Picked Up', time: '35 min', total: '$28.00' },
];

const fallbackProducts: MerchantProduct[] = [
  { name: 'Classic Burger', price: '$12.50', stock: 'Available', orders: 142, img: '🍔' },
  { name: 'Cheese Fries', price: '$5.00', stock: 'Available', orders: 98, img: '🍟' },
  { name: 'Chicken Wrap', price: '$11.00', stock: 'Low Stock', orders: 67, img: '🌯' },
  { name: 'Lemonade', price: '$4.50', stock: 'Out of Stock', orders: 201, img: '🍋' },
];

const defaultDashboardData: MerchantDashboardData = {
  storeName: 'Burger Bliss',
  storeEmail: 'merchant@delivo.com',
  stats: fallbackStats,
  orders: fallbackOrders,
  products: fallbackProducts,
};

export const useMerchantDashboard = () => {
  const [data, setData] = useState<MerchantDashboardData>(defaultDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Microservice-aware fetch flow via API gateway.
        const [meResult, ordersResult] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/orders?scope=merchant&limit=4'),
        ]);

        const user =
          meResult.status === 'fulfilled'
            ? meResult.value?.data?.data?.user
            : null;

        const ordersFromApi =
          ordersResult.status === 'fulfilled'
            ? ordersResult.value?.data?.data?.orders
            : null;

        const mappedOrders: MerchantOrder[] = Array.isArray(ordersFromApi)
          ? ordersFromApi.slice(0, 4).map((order: any) => ({
              id: order.id || order.orderId || '#ORD-0000',
              customer: order.customerName || order.customer || 'Unknown Customer',
              items: order.itemsText || 'Order items',
              status: (order.status || 'Preparing') as MerchantOrder['status'],
              time: order.timeAgo || 'Just now',
              total: order.total ? `$${Number(order.total).toFixed(2)}` : '$0.00',
            }))
          : fallbackOrders;

        setData({
          storeName: user?.name || defaultDashboardData.storeName,
          storeEmail: user?.email || defaultDashboardData.storeEmail,
          stats: fallbackStats,
          orders: mappedOrders,
          products: fallbackProducts,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        setData(defaultDashboardData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
};
