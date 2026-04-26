import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { MerchantDashboardData, MerchantOrder, MerchantProduct, MerchantStat } from '../types/merchant.types';

const emptyDashboardData: MerchantDashboardData = {
  storeName: '',
  storeEmail: '',
  stats: [
    { label: "Today's Revenue", value: '$0.00', change: '0%', icon: 'revenue', color: '#fde68a' },
    { label: 'Active Orders', value: '0', change: '0', icon: 'active-orders', color: '#fb923c' },
    { label: 'Products Listed', value: '0', change: '0', icon: 'products', color: '#a5b4fc' },
    { label: 'Avg Rating', value: '0.0', change: '0', icon: 'rating', color: '#fde68a' },
  ],
  orders: [],
  products: [],
};

export const useMerchantDashboard = () => {
  const [data, setData] = useState<MerchantDashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Microservice-aware fetch flow via API gateway.
        const [meResult, ordersResult, productsResult] = await Promise.allSettled([
          api.get('/users/me'),
          api.get('/orders?scope=merchant&limit=4'),
          api.get('/products/merchant/me'),
        ]);

        const user =
          meResult.status === 'fulfilled'
            ? meResult.value?.data?.data?.user
            : null;

        const ordersFromApi =
          ordersResult.status === 'fulfilled'
            ? ordersResult.value?.data?.data?.orders
            : null;

        const productsFromApi =
          productsResult.status === 'fulfilled'
            ? productsResult.value?.data?.data || productsResult.value?.data
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
          : [];

        const mappedProducts: MerchantProduct[] = Array.isArray(productsFromApi)
          ? productsFromApi.map((p: any) => ({
              name: p.name,
              price: `$${Number(p.price).toFixed(2)}`,
              stock: (p.stock > 10 ? 'Available' : p.stock > 0 ? 'Low Stock' : 'Out of Stock') as MerchantProduct['stock'],
              orders: p.orders_count || 0,
              img: 'box',
              imageUrl: p.image_url,
            }))
          : [];

        setData({
          storeName: user?.name || '',
          storeEmail: user?.email || '',
          logoUrl: user?.logo_url,
          stats: emptyDashboardData.stats, // Stats mapping not implemented yet
          orders: mappedOrders,
          products: mappedProducts,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        setData(emptyDashboardData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { data, loading, error };
};
