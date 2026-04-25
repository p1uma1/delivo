import api from '../../../../shared/api/api';
import { CartItem, CartState } from '../types/customer.types';

export const cartService = {
  /**
   * Fetches the current user's cart from the backend.
   */
  async getCart(): Promise<CartState> {
    const response = await api.get('/cart');
    return response.data?.data || response.data;
  },

  /**
   * Adds an item to the backend cart.
   */
  async addItem(item: Omit<CartItem, 'quantity'>): Promise<CartItem> {
    const response = await api.post('/cart/items', {
      ...item,
      quantity: 1
    });
    return response.data?.data || response.data;
  },

  /**
   * Updates the quantity of an item in the backend cart.
   */
  async updateItemQuantity(productId: string, quantity: number): Promise<void> {
    await api.patch(`/cart/items/${productId}`, { quantity });
  },

  /**
   * Removes an item from the backend cart.
   */
  async removeItem(productId: string): Promise<void> {
    await api.delete(`/cart/items/${productId}`);
  },

  /**
   * Clears the entire cart on the backend.
   */
  async clearCart(): Promise<void> {
    await api.delete('/cart');
  }
};
