import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { Merchant } from '../types/customer.types';

const fallbackMerchants: Merchant[] = [
  { id: 'm1', name: 'Burger Bliss', description: 'Gourmet burgers and fries', rating: '4.9', time: '20 min', icon: '🍔', address: 'Galle Road, Colombo 03', category: 'Burgers' },
  { id: 'm2', name: 'Pizza Palace', description: 'Authentic wood-fired pizzas', rating: '4.7', time: '30 min', icon: '🍕', address: 'Duplication Road, Colombo 04', category: 'Pizza' },
  { id: 'm3', name: 'Sushi Stop', description: 'Fresh sushi and sashimi', rating: '4.8', time: '25 min', icon: '🍱', address: 'Flower Road, Colombo 07', category: 'Japanese' },
  { id: 'm4', name: 'Green Bowl', description: 'Healthy salads and bowls', rating: '4.6', time: '15 min', icon: '🥗', address: 'Reid Avenue, Colombo 07', category: 'Healthy' },
  { id: 'm5', name: 'Spice Route', description: 'Traditional Sri Lankan curries', rating: '4.5', time: '35 min', icon: '🍛', address: 'Marine Drive, Colombo 03', category: 'Sri Lankan' },
];

export const useMerchants = (merchantId?: string) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        setLoading(true);
        setError(null);

        if (merchantId) {
          const response = await api.get(`/products/merchants/${merchantId}`);
          setMerchant(response.data?.data || null);
        } else {
          const response = await api.get('/products/merchants');
          const data = response.data?.data || response.data || [];
          setMerchants(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load merchants');
        if (merchantId) {
          setMerchant(null);
        } else {
          setMerchants([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMerchants();
  }, [merchantId]);

  return { merchants, merchant, loading, error };
};
