import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { Product } from '../types/customer.types';

const fallbackProducts: Product[] = [
  { id: 'p1', name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: '$12.50', category: 'Main', icon: '🍔', merchant_id: 'm1', merchant_name: 'Burger Bliss' },
  { id: 'p2', name: 'Cheese Fries', description: 'Golden fries topped with melted cheese', price: '$6.00', category: 'Sides', icon: '🍟', merchant_id: 'm1', merchant_name: 'Burger Bliss' },
  { id: 'p3', name: 'Margherita Pizza', description: 'Fresh basil and mozzarella', price: '$16.00', category: 'Pizza', icon: '🍕', merchant_id: 'm2', merchant_name: 'Pizza Palace' },
  { id: 'p4', name: 'Dragon Roll', description: 'Shrimp tempura and avocado', price: '$18.50', category: 'Sushi', icon: '🍱', merchant_id: 'm3', merchant_name: 'Sushi Stop' },
  { id: 'p5', name: 'Acai Bowl', description: 'Mixed berries and granola', price: '$11.00', category: 'Healthy', icon: '🥗', merchant_id: 'm4', merchant_name: 'Green Bowl' },
  { id: 'p6', name: 'Chicken Kottu', description: 'Shredded flatbread with chicken', price: '$9.50', category: 'Main', icon: '🍛', merchant_id: 'm5', merchant_name: 'Spice Route' },
];

export const useProducts = (productId?: string, merchantId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const mapProduct = (p: any): Product => {
          if (!p) return p;
          return { ...p, merchant_id: p.merchant_id || p.merchantId, merchant_name: p.merchant_name || p.merchantName };
        };

        if (productId) {
          const response = await api.get(`/products/${productId}`);
          const raw = response.data?.data || response.data;
          setProduct(raw ? mapProduct(raw) : null);
        } else if (merchantId) {
          const response = await api.get(`/products/merchant/${merchantId}`);
          const data = response.data?.data || response.data || [];
          setProducts(Array.isArray(data) ? data.map(mapProduct) : []);
        } else {
          const response = await api.get('/products');
          const data = response.data?.data || response.data || [];
          setProducts(Array.isArray(data) ? data.map(mapProduct) : []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        if (productId) {
          setProduct(null);
        } else if (merchantId) {
          setProducts([]);
        } else {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [productId, merchantId]);

  return { products, product, loading, error };
};
