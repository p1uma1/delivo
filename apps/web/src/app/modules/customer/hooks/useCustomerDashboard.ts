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

const emptyDashboard: CustomerDashboardData = {
  name: '',
  location: '',
  activeOrder: {
    id: '',
    merchant: '',
    items: [],
    total: '$0.00',
    eta: '-- min',
    rider: '',
    riderPhone: '',
    status: 0,
  },
  orderHistory: [],
  recommended: [],
  cartCount: 0,
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
  const [data, setData] = useState<CustomerDashboardData>(emptyDashboard);
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
              id: activeSource.id || activeSource.orderId || emptyDashboard.activeOrder.id,
              merchant: activeSource.merchantName || activeSource.merchant || emptyDashboard.activeOrder.merchant,
              items: Array.isArray(activeSource.items)
                ? activeSource.items.map((item: any) => getItemLabel(item))
                : emptyDashboard.activeOrder.items,
              total: formatMoney(activeSource.totalAmount ?? activeSource.total ?? 27.5),
              eta: activeSource.eta || emptyDashboard.activeOrder.eta,
              rider: activeSource.riderName || emptyDashboard.activeOrder.rider,
              riderPhone: activeSource.riderPhone || emptyDashboard.activeOrder.riderPhone,
              status: orderStageByStatus[String(activeSource.status).toUpperCase()] ?? emptyDashboard.activeOrder.status,
            }
          : emptyDashboard.activeOrder;

        const stats = statsResult.status === 'fulfilled' ? statsResult.value.data?.data : null;
        const recommendedRaw = recommendedResult.status === 'fulfilled' ? recommendedResult.value.data : null;
        const recommendedItems: RecommendedItem[] = Array.isArray(recommendedRaw) && recommendedRaw.length > 0
          ? recommendedRaw.map((p: any) => ({
              name: p.name,
              merchant: p.merchantName || 'Merchant',
              price: formatMoney(p.price),
              rating: p.rating || '4.5',
              icon: p.icon || '🍽️',
              imageUrl: p.image_url,
              time: p.time || '25 min'
            }))
          : defaultRecommended;

        setData({
          name: profile?.name || emptyDashboard.name,
          location: profile?.location || emptyDashboard.location,
          activeOrder,
          orderHistory: mappedOrders.length > 0 ? mappedOrders : emptyDashboard.orderHistory,
          recommended: recommendedItems,
          cartCount: Math.max(0, rawOrders.length || emptyDashboard.cartCount),
          stats: stats || undefined,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load customer dashboard';
        setError(message);
        setData(emptyDashboard);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
};
