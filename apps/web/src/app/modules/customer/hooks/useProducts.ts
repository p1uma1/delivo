import { useEffect, useState } from 'react';
import api from '../../../../shared/api/api';
import { Product } from '../types/customer.types';

const fallbackProducts: Product[] = [
  { id: 'p1', name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: '$12.50', category: 'Main', icon: '🍔', merchantId: 'm1', merchantName: 'Burger Bliss' },
  { id: 'p2', name: 'Cheese Fries', description: 'Golden fries topped with melted cheese', price: '$6.00', category: 'Sides', icon: '🍟', merchantId: 'm1', merchantName: 'Burger Bliss' },
  { id: 'p3', name: 'Margherita Pizza', description: 'Fresh basil and mozzarella', price: '$16.00', category: 'Pizza', icon: '🍕', merchantId: 'm2', merchantName: 'Pizza Palace' },
  { id: 'p4', name: 'Dragon Roll', description: 'Shrimp tempura and avocado', price: '$18.50', category: 'Sushi', icon: '🍱', merchantId: 'm3', merchantName: 'Sushi Stop' },
  { id: 'p5', name: 'Acai Bowl', description: 'Mixed berries and granola', price: '$11.00', category: 'Healthy', icon: '🥗', merchantId: 'm4', merchantName: 'Green Bowl' },
  { id: 'p6', name: 'Chicken Kottu', description: 'Shredded flatbread with chicken', price: '$9.50', category: 'Main', icon: '🍛', merchantId: 'm5', merchantName: 'Spice Route' },
];

export const useProducts = (productId?: string, merchantId?: string) => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
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
          return { ...p, merchantId: p.merchantId || p.merchant_id };
        };

        if (productId) {
          const response = await api.get(`/products/${productId}`);
          const raw = response.data?.data || response.data;
          setProduct(raw ? mapProduct(raw) : fallbackProducts.find(p => p.id === productId) || null);
        } else if (merchantId) {
          const response = await api.get(`/products/merchant/${merchantId}`);
          const data = response.data?.data || response.data || [];
          setProducts(Array.isArray(data) && data.length > 0 ? data.map(mapProduct) : fallbackProducts.filter(p => p.merchantId === merchantId));
        } else {
          const response = await api.get('/products');
          const data = response.data?.data || response.data || [];
          setProducts(Array.isArray(data) && data.length > 0 ? data.map(mapProduct) : fallbackProducts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        if (productId) {
          setProduct(fallbackProducts.find(p => p.id === productId) || null);
        } else if (merchantId) {
          setProducts(fallbackProducts.filter(p => p.merchantId === merchantId));
        } else {
          setProducts(fallbackProducts);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [productId, merchantId]);

  return { products, product, loading, error };
};
