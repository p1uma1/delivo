import { useState } from 'react';
import api from '../../../../shared/api/api';

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
}

export const useProductManagement = () => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (input: CreateProductInput) => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await api.post('/products', input);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      setError(message);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  const updateProduct = async (id: string, input: Partial<CreateProductInput>) => {
    try {
      setCreating(true);
      setError(null);
      
      const response = await api.put(`/products/${id}`, input);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      setError(message);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    creating,
    error,
  };
};
