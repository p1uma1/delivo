import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { RiderDashboardData, RiderRecentDelivery, RiderTodayStat } from '../types/rider.types';

const fallbackStats: RiderTodayStat[] = [
  { label: 'Deliveries Done', value: '8', icon: 'deliveries', color: '#6ee7b7' },
  { label: 'Earnings Today', value: 'Rs 38.40', icon: 'earnings', color: '#fde68a' },
  { label: 'Distance', value: '42 km', icon: 'distance', color: '#93c5fd' },
  { label: 'Avg Rating', value: '4.9', icon: 'rating', color: '#fde68a' },
];

const fallbackRecentDeliveries: RiderRecentDelivery[] = [
  { id: '#ORD-8820', customer: 'Nimal Perera', address: 'Marine Dr, Colombo 06', time: '14:32', earning: 'Rs 5.20', rating: 5 },
  { id: '#ORD-8815', customer: 'Dilani Fernando', address: 'Torrington Ave, Col 07', time: '13:48', earning: 'Rs 3.80', rating: 5 },
  { id: '#ORD-8810', customer: 'Kasun Silva', address: 'Baseline Rd, Colombo 09', time: '12:20', earning: 'Rs 6.10', rating: 4 },
  { id: '#ORD-8803', customer: 'Priya Jayasekara', address: 'Havelock Rd, Col 05', time: '11:05', earning: 'Rs 4.20', rating: 5 },
];

const fallbackDashboard: RiderDashboardData = {
  name: 'Chamara Bandara',
  zone: 'Colombo Zone',
  isOnline: true,
  currentDelivery: {
    id: '#ORD-8821',
    customer: 'Amara Silva',
    customerPhone: '+94 77 987 6543',
    merchant: 'Burger Bliss',
    merchantAddress: '45 Galle Rd, Colombo 03',
    deliveryAddress: '12 Marine Dr, Colombo 06',
    items: ['Classic Burger x1', 'Cheese Fries x2', 'Lemonade x1'],
    total: 'Rs 27.50',
    distance: '3.2 km',
    eta: '12 min',
    earning: 'Rs 4.50',
    status: 2,
  },
  todayStats: fallbackStats,
  recentDeliveries: fallbackRecentDeliveries,
};

const deliveryStatusToStage: Record<string, number> = {
  PENDING: 0,
  ASSIGNED: 1,
  PICKED_UP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
  FAILED: 4,
};

const toCurrency = (value: unknown, fallback = 'Rs 0.00') => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? `Rs ${numberValue.toFixed(2)}` : fallback;
};

const formatDeliveryItem = (item: any) => {
  if (typeof item === 'string') {
    return item;
  }

  const quantitySuffix = item?.quantity ? ` x${item.quantity}` : '';
  return `${item?.name || 'Item'}${quantitySuffix}`;
};

export const useRiderDashboard = () => {
  const [data, setData] = useState<RiderDashboardData>(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileResult, assignmentsResult] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/deliveries/rider/assignments'),
        ]);

        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data?.data?.user : null;
        const assignmentsPayload = assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data?.data : null;
        const rawAssignments = Array.isArray(assignmentsPayload) ? assignmentsPayload : assignmentsPayload?.deliveries || [];

        const mappedRecentDeliveries: RiderRecentDelivery[] = rawAssignments.slice(0, 4).map((delivery: any, index: number) => ({
          id: delivery.orderId || delivery.id || `#ORD-${8820 - index}`,
          customer: delivery.customerName || delivery.customer || 'Customer',
          address: delivery.deliveryAddress || delivery.address || 'Unknown address',
          time: delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          earning: toCurrency(delivery.earning ?? delivery.fee ?? 0),
          rating: Number(delivery.rating || 5),
        }));

        const activeSource = rawAssignments.find((delivery: any) => !['DELIVERED', 'FAILED'].includes(String(delivery.status).toUpperCase())) || rawAssignments[0];

        const currentDelivery = activeSource
          ? {
              id: activeSource.orderId || activeSource.id || fallbackDashboard.currentDelivery.id,
              customer: activeSource.customerName || fallbackDashboard.currentDelivery.customer,
              customerPhone: activeSource.customerPhone || fallbackDashboard.currentDelivery.customerPhone,
              merchant: activeSource.merchantName || fallbackDashboard.currentDelivery.merchant,
              merchantAddress: activeSource.pickupAddress || fallbackDashboard.currentDelivery.merchantAddress,
              deliveryAddress: activeSource.deliveryAddress || fallbackDashboard.currentDelivery.deliveryAddress,
              items: Array.isArray(activeSource.items)
                ? activeSource.items.map((item: any) => formatDeliveryItem(item))
                : fallbackDashboard.currentDelivery.items,
              total: toCurrency(activeSource.totalAmount ?? activeSource.total ?? 27.5),
              distance: activeSource.distance || fallbackDashboard.currentDelivery.distance,
              eta: activeSource.eta || fallbackDashboard.currentDelivery.eta,
              earning: toCurrency(activeSource.earning ?? 4.5),
              status: deliveryStatusToStage[String(activeSource.status).toUpperCase()] ?? fallbackDashboard.currentDelivery.status,
            }
          : fallbackDashboard.currentDelivery;

        setData({
          name: profile?.name || fallbackDashboard.name,
          zone: profile?.zone || profile?.location || fallbackDashboard.zone,
          isOnline: typeof profile?.isOnline === 'boolean' ? profile.isOnline : fallbackDashboard.isOnline,
          currentDelivery,
          todayStats: fallbackStats,
          recentDeliveries: mappedRecentDeliveries.length > 0 ? mappedRecentDeliveries : fallbackRecentDeliveries,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load rider dashboard';
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
