import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { CustomerDashboardData, CustomerOrderHistory, RecommendedItem } from '../types/customer.types';

const defaultRecommended: RecommendedItem[] = [
  { name: 'New Item', merchant: 'New Merchant', price: '$10.00', rating: '4.5', icon: '🍽️', time: '20 min' },
  { name: 'Classic Burger', merchant: 'Burger Bliss', price: '$12.50', rating: '4.9', icon: '🍔', time: '20 min' },
  { name: 'Margherita Pizza', merchant: 'Pizza Palace', price: '$16.00', rating: '4.7', icon: '🍕', time: '30 min' },
  { name: 'Dragon Roll', merchant: 'Sushi Stop', price: '$18.50', rating: '4.8', icon: '🍱', time: '25 min' },
  { name: 'Acai Bowl', merchant: 'Green Bowl', price: '$11.00', rating: '4.6', icon: '🥗', time: '15 min' },
];

const fallbackDashboard: CustomerDashboardData = {
  name: 'Tharushi S.',
  location: 'Colombo 03, Sri Lanka',
  activeOrder: {
    id: '#ORD-8821',
    merchant: 'Burger Bliss',
    items: ['Classic Burger x1', 'Cheese Fries x2', 'Lemonade x1'],
    total: '$27.50',
    eta: '18 min',
    rider: 'Chamara B.',
    riderPhone: '+94 77 123 4567',
    status: 2,
  },
  orderHistory: [
    { id: '#ORD-8804', merchant: 'Pizza Palace', date: 'Apr 23', total: '$38.00', status: 'Delivered', icon: '🍕' },
    { id: '#ORD-8795', merchant: 'Sushi Stop', date: 'Apr 20', total: '$52.75', status: 'Delivered', icon: '🍱' },
    { id: '#ORD-8780', merchant: 'Green Bowl', date: 'Apr 17', total: '$22.00', status: 'Delivered', icon: '🥗' },
    { id: '#ORD-8762', merchant: 'Spice Route', date: 'Apr 12', total: '$33.50', status: 'Cancelled', icon: '🍛' },
  ],
  recommended: defaultRecommended,
  cartCount: 3,
};

const orderStageByStatus: Record<string, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  PICKED_UP: 3,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  CANCELLED: 4,
};

const formatMoney = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? `$${numberValue.toFixed(2)}` : '$0.00';
};

const getItemLabel = (item: any) => {
  if (typeof item === 'string') return item;
  const quantity = item?.quantity ? ` x${item.quantity}` : '';
  return `${item?.name || 'Item'}${quantity}`;
};

export const useCustomerDashboard = () => {
  const [data, setData] = useState<CustomerDashboardData>(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileResult, ordersResult, statsResult, recommendedResult] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/orders'),
          api.get('/orders/stats'),
          api.get('/products/recommended'),
        ]);

        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data?.data?.user : null;
        const ordersPayload = ordersResult.status === 'fulfilled' ? ordersResult.value.data?.data : null;
        const rawOrders = Array.isArray(ordersPayload) ? ordersPayload : ordersPayload?.orders || [];
        const mappedOrders: CustomerOrderHistory[] = rawOrders.slice(0, 4).map((order: any, index: number) => {
          const normalizedStatus = String(order.status || 'PROCESSING').toUpperCase();
          let status: CustomerOrderHistory['status'] = 'Processing';

          if (normalizedStatus === 'CANCELLED') {
            status = 'Cancelled';
          } else if (normalizedStatus === 'DELIVERED') {
            status = 'Delivered';
          }

          return {
            id: order.id || order.orderId || `#ORD-${8800 - index}`,
            merchant: order.merchantName || order.merchant || 'Merchant',
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today',
            total: formatMoney(order.totalAmount ?? order.total ?? 0),
            status,
            icon: order.icon || '🍽️',
          };
        });

        const activeSource = rawOrders.find((order: any) => !['DELIVERED', 'CANCELLED'].includes(String(order.status).toUpperCase())) || rawOrders[0];
        const activeOrder = activeSource
          ? {
              id: activeSource.id || activeSource.orderId || fallbackDashboard.activeOrder.id,
              merchant: activeSource.merchantName || activeSource.merchant || fallbackDashboard.activeOrder.merchant,
              items: Array.isArray(activeSource.items)
                ? activeSource.items.map((item: any) => getItemLabel(item))
                : fallbackDashboard.activeOrder.items,
              total: formatMoney(activeSource.totalAmount ?? activeSource.total ?? 27.5),
              eta: activeSource.eta || fallbackDashboard.activeOrder.eta,
              rider: activeSource.riderName || fallbackDashboard.activeOrder.rider,
              riderPhone: activeSource.riderPhone || fallbackDashboard.activeOrder.riderPhone,
              status: orderStageByStatus[String(activeSource.status).toUpperCase()] ?? fallbackDashboard.activeOrder.status,
            }
          : fallbackDashboard.activeOrder;

        const stats = statsResult.status === 'fulfilled' ? statsResult.value.data?.data : null;
        const recommendedRaw = recommendedResult.status === 'fulfilled' ? recommendedResult.value.data : null;
        const recommendedItems: RecommendedItem[] = Array.isArray(recommendedRaw) && recommendedRaw.length > 0
          ? recommendedRaw.map((p: any) => ({
              name: p.name,
              merchant: p.merchantName || 'Merchant',
              price: formatMoney(p.price),
              rating: p.rating || '4.5',
              icon: p.icon || '🍽️',
              time: p.time || '25 min'
            }))
          : defaultRecommended;

        setData({
          name: profile?.name || fallbackDashboard.name,
          location: profile?.location || fallbackDashboard.location,
          activeOrder,
          orderHistory: mappedOrders.length > 0 ? mappedOrders : fallbackDashboard.orderHistory,
          recommended: recommendedItems,
          cartCount: Math.max(1, rawOrders.length || fallbackDashboard.cartCount),
          stats: stats || undefined,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load customer dashboard';
        setError(message);
        setData(fallbackDashboard);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
};
