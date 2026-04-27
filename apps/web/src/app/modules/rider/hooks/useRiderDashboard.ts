import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { RiderDashboardData, RiderRecentDelivery, RiderTodayStat, PendingOrder, DeliveryOffer } from '../types/rider.types';

const emptyDashboard: RiderDashboardData = {
  name: 'Unknown Rider',
  zone: 'Unknown Zone',
  isOnline: false,
  currentDelivery: null,
  todayStats: [],
  recentDeliveries: [],
  pendingOrders: [],
  submittedOffers: [],
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
  const [data, setData] = useState<RiderDashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const reload = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileResult, assignmentsResult, pendingOrdersResult, submittedOffersResult] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/deliveries/rider/assignments'),
          api.get('/orders/pending-orders'),
          api.get('/deliveries/rider/my-offers'),
        ]);

        const profile = profileResult.status === 'fulfilled' ? profileResult.value.data?.data?.user : null;
        const assignmentsPayload = assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data?.data : null;
        const rawAssignments = Array.isArray(assignmentsPayload) ? assignmentsPayload : assignmentsPayload?.deliveries || [];
        
        // Fetch pending orders (orders waiting for rider offers)
        const pendingOrdersData = pendingOrdersResult.status === 'fulfilled' ? pendingOrdersResult.value.data?.data : [];
        const pendingOrders = Array.isArray(pendingOrdersData) ? pendingOrdersData : [];

        // Fetch submitted offers
        const submittedOffersData = submittedOffersResult.status === 'fulfilled' ? submittedOffersResult.value.data?.data : [];
        const submittedOffers = Array.isArray(submittedOffersData) ? submittedOffersData : [];

        const mappedRecentDeliveries: RiderRecentDelivery[] = rawAssignments.slice(0, 4).map((delivery: any, index: number) => ({
          id: delivery.orderId || delivery.id,
          customer: delivery.customerName || delivery.customer || 'Customer',
          address: delivery.deliveryAddress || delivery.address || 'Unknown address',
          time: delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          earning: toCurrency(delivery.earning ?? delivery.fee ?? 0),
          rating: Number(delivery.rating || 5),
        }));

        const activeSource = rawAssignments.find((delivery: any) => !['DELIVERED', 'FAILED'].includes(String(delivery.status).toUpperCase())) || rawAssignments[0];

        const currentDelivery = activeSource
          ? {
              id: activeSource.orderId || activeSource.id || '',
              customer: activeSource.customerName || '',
              customerPhone: activeSource.customerPhone || '',
              merchant: activeSource.merchantName || '',
              merchantAddress: activeSource.pickupAddress || '',
              deliveryAddress: activeSource.deliveryAddress || '',
              items: Array.isArray(activeSource.items)
                ? activeSource.items.map((item: any) => formatDeliveryItem(item))
                : [],
              total: toCurrency(activeSource.totalAmount ?? activeSource.total ?? 0),
              distance: activeSource.distance || '0 km',
              eta: activeSource.eta || '-',
              earning: toCurrency(activeSource.earning ?? 0),
              status: deliveryStatusToStage[String(activeSource.status).toUpperCase()] ?? 0,
            }
          : null;

        setData({
          name: profile?.name || 'Unknown Rider',
          zone: profile?.zone || profile?.location || 'Unknown Zone',
          isOnline: typeof profile?.isOnline === 'boolean' ? profile.isOnline : false,
          currentDelivery,
          todayStats: [], // Real API doesn't seem to have todayStats yet? We will return empty for now
          recentDeliveries: mappedRecentDeliveries,
          pendingOrders,
          submittedOffers,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load rider dashboard';
        setError(message);
        setData(emptyDashboard);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [refreshTrigger]);

  return { data, loading, error, reload };
};
